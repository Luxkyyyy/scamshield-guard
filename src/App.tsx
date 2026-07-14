import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Phone,
  Radar,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HistoryEntry, ScamAnalysis } from "@/lib/scam-analysis";

const HISTORY_KEY = "scamshield-history-v2";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB raw

type Mode = "message" | "url" | "image" | "phone";

function riskTone(level: ScamAnalysis["riskLevel"]) {
  if (level === "High") return "text-danger border-danger/30 bg-danger/10";
  if (level === "Medium") return "text-warning border-warning/30 bg-warning/10";
  return "text-success border-success/30 bg-success/10";
}

function reputationTone(rep: NonNullable<ScamAnalysis["phone"]>["reputation"]) {
  if (rep === "Known scam pattern" || rep === "Suspicious")
    return "text-danger border-danger/30 bg-danger/10";
  if (rep === "Unknown") return "text-warning border-warning/30 bg-warning/10";
  return "text-success border-success/30 bg-success/10";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [mode, setMode] = useState<Mode>("message");
  const [input, setInput] = useState("");
  const [phone, setPhone] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<ScamAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const analyzerRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved) as HistoryEntry[]);
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const resetInputs = () => {
    setInput("");
    setPhone("");
    setImageDataUrl(null);
    setImageName("");
    setError("");
  };

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large. Use one under 5 MB.");
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      setImageDataUrl(url);
      setImageName(file.name);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read image.");
    }
  };

  const buildPayload = (): { ok: true; payload: Record<string, unknown>; summary: string } | { ok: false; error: string } => {
    if (mode === "message") {
      const m = input.trim();
      if (m.length < 8) return { ok: false, error: "Enter at least 8 characters to analyze." };
      return { ok: true, payload: { message: m }, summary: m };
    }
    if (mode === "url") {
      const u = input.trim();
      try {
        const url = new URL(u);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return { ok: false, error: "Enter a complete URL beginning with http:// or https://." };
      }
      return {
        ok: true,
        payload: { message: `Suspicious URL submitted for analysis: ${u}` },
        summary: u,
      };
    }
    if (mode === "image") {
      if (!imageDataUrl) return { ok: false, error: "Upload a screenshot to analyze." };
      const payload: Record<string, unknown> = { imageDataUrl };
      const caption = input.trim();
      if (caption) payload.message = caption;
      if (phone.trim()) payload.phoneNumber = phone.trim();
      return { ok: true, payload, summary: imageName || "Screenshot" };
    }
    // phone
    const p = phone.trim();
    if (!p) return { ok: false, error: "Enter a phone number to analyze." };
    const payload: Record<string, unknown> = { phoneNumber: p };
    const m = input.trim();
    if (m.length >= 8) payload.message = m;
    return { ok: true, payload, summary: m ? `${p} — ${m.slice(0, 60)}` : p };
  };

  const analyze = async () => {
    const built = buildPayload();
    if (!built.ok) {
      setError(built.error);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(built.payload),
      });
      const rawText = await response.text();
      let payload: (ScamAnalysis & { error?: undefined }) | { error?: string } | null = null;
      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = null;
        }
      }
      if (!response.ok) {
        const msg =
          (payload && "error" in payload && payload.error) ||
          (response.status === 404
            ? "Analyzer endpoint not found. On Netlify, redeploy so /api/analyze is available."
            : response.status === 413
              ? "Screenshot too large. Try a smaller image."
              : `Analysis failed (HTTP ${response.status}).`);
        throw new Error(msg);
      }
      if (!payload) throw new Error("The analyzer returned an empty response. Please try again.");
      if ("error" in payload && payload.error) throw new Error(payload.error);
      const analysis = payload as ScamAnalysis;
      setResult(analysis);
      const entry: HistoryEntry = {
        ...analysis,
        id: crypto.randomUUID(),
        input: built.summary.slice(0, 240),
        createdAt: new Date().toISOString(),
        kind: mode,
      };
      setHistory((current) => {
        const next = [entry, ...current].slice(0, 8);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = (entry: HistoryEntry) => {
    setMode(entry.kind);
    setInput(entry.input);
    setResult(entry);
    analyzerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canSubmit =
    !loading &&
    ((mode === "message" && input.trim().length >= 8) ||
      (mode === "url" && input.trim().length > 0) ||
      (mode === "image" && !!imageDataUrl) ||
      (mode === "phone" && phone.trim().length > 0));

  const tabs: Array<{ id: Mode; label: string; Icon: typeof FileText }> = [
    { id: "message", label: "Message", Icon: FileText },
    { id: "url", label: "URL", Icon: Link2 },
    { id: "image", label: "Screenshot", Icon: ImageIcon },
    { id: "phone", label: "Phone", Icon: Phone },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8"
          aria-label="Main navigation"
        >
          <a href="#top" className="flex items-center gap-3" aria-label="ScamShield AI home">
            <img
              src="/scamshield-logo.png"
              alt="ScamShield AI shield logo"
              className="h-11 w-36 rounded-md object-cover object-center"
            />
          </a>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#analyzer" className="transition-colors hover:text-foreground">
              Analyzer
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#history" className="transition-colors hover:text-foreground">
              History
            </a>
          </div>
          <Button
            size="sm"
            onClick={() => analyzerRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            Scan now <ArrowRight />
          </Button>
        </nav>
      </header>

      <main id="top">
        <section className="hero-grid relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 pb-20 pt-32 lg:px-8">
          <div className="relative z-10 grid w-full items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <h1 className="max-w-3xl text-balance text-5xl font-bold leading-[1] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Think before
                <br />
                you <span className="text-primary">click.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
                Paste a message, drop a screenshot, or check a phone number. ScamShield AI scores
                the risk and tells you exactly what to do next.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="h-12 rounded-lg px-6"
                  onClick={() => analyzerRef.current?.scrollIntoView({ behavior: "smooth" })}
                >
                  Analyze a threat <ArrowRight />
                </Button>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4 text-success" /> Your content is not stored on our
                  servers
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="scan-panel relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-panel backdrop-blur-xl">
                <div className="scan-line" aria-hidden="true" />
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/12 p-2.5 text-primary">
                      <Fingerprint />
                    </div>
                    <div>
                      <p className="font-semibold">Live threat scan</p>
                      <p className="text-xs text-muted-foreground">Signal analysis engine</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-xs font-medium text-success">
                    <span className="size-2 rounded-full bg-success animate-pulse" /> Online
                  </span>
                </div>
                <div className="space-y-4 py-6">
                  {[
                    "Sender authenticity",
                    "Urgency & pressure",
                    "Credential requests",
                    "Link & number signals",
                  ].map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-3.5"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary font-mono text-xs text-muted-foreground">
                        0{index + 1}
                      </div>
                      <span className="flex-1 text-sm">{label}</span>
                      <CheckCircle2 className="size-4 text-success" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-danger/25 bg-danger/8 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Threat detected
                    </p>
                    <p className="mt-1 font-semibold text-danger">Credential phishing</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-danger">92</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={analyzerRef}
          id="analyzer"
          className="scroll-mt-24 border-y border-border bg-surface py-20"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="eyebrow">Threat analyzer</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Is it a scam? Let's find out.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Analyze messages, screenshots, URLs, and phone numbers. Never paste passwords,
                OTPs, or financial details.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
                <div className="mb-5 grid grid-cols-4 gap-1 rounded-xl bg-secondary p-1">
                  {tabs.map(({ id, label, Icon }) => (
                    <Button
                      key={id}
                      variant={mode === id ? "default" : "ghost"}
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        setMode(id);
                        resetInputs();
                      }}
                    >
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  ))}
                </div>

                {mode === "image" ? (
                  <div className="space-y-4">
                    <label className="mb-2 block text-sm font-medium">Upload a screenshot</label>
                    {imageDataUrl ? (
                      <div className="relative overflow-hidden rounded-xl border border-border bg-background">
                        <img
                          src={imageDataUrl}
                          alt="Screenshot to analyze"
                          className="max-h-72 w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageDataUrl(null);
                            setImageName("");
                          }}
                          className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-card hover:bg-background"
                          aria-label="Remove screenshot"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        <Upload className="size-6" />
                        <span className="text-sm font-medium">Click to upload screenshot</span>
                        <span className="text-xs">PNG, JPG, WEBP — up to 5 MB</span>
                      </button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleImage(e.target.files?.[0])}
                    />
                    <div>
                      <label htmlFor="image-caption" className="mb-1 block text-xs font-medium">
                        Optional context
                      </label>
                      <Textarea
                        id="image-caption"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. Got this SMS this morning from an unknown number"
                        className="min-h-20 resize-none rounded-xl bg-background p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="image-phone" className="mb-1 block text-xs font-medium">
                        Sender phone (optional)
                      </label>
                      <Input
                        id="image-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        className="rounded-xl bg-background"
                      />
                    </div>
                  </div>
                ) : mode === "phone" ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone-input" className="mb-2 block text-sm font-medium">
                        Phone number
                      </label>
                      <Input
                        id="phone-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        className="rounded-xl bg-background text-base"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Include the country code (e.g. +1, +44, +254) for the best analysis.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="phone-context" className="mb-1 block text-xs font-medium">
                        Message they sent (optional)
                      </label>
                      <Textarea
                        id="phone-context"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste the text they sent so AI can analyze both together"
                        className="min-h-32 resize-none rounded-xl bg-background p-3"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <label htmlFor="analysis-input" className="mb-2 block text-sm font-medium">
                      {mode === "message" ? "Paste suspicious content" : "Paste suspicious URL"}
                    </label>
                    <Textarea
                      id="analysis-input"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      maxLength={12_000}
                      placeholder={
                        mode === "message"
                          ? "Example: Your account has been suspended. Verify your details immediately..."
                          : "https://suspicious-example.com/verify"
                      }
                      className="min-h-56 resize-none rounded-xl bg-background p-4 leading-6"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Content is analyzed securely</span>
                      <span>{input.length.toLocaleString()} / 12,000</span>
                    </div>
                  </>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mt-4 flex gap-2 rounded-lg border border-danger/25 bg-danger/8 p-3 text-sm text-danger"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  onClick={analyze}
                  disabled={!canSubmit}
                  className="mt-5 h-12 w-full rounded-xl text-base shadow-glow"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Investigating signals…
                    </>
                  ) : (
                    <>
                      <ShieldCheck /> Analyze for scams
                    </>
                  )}
                </Button>
              </div>

              <div className="min-h-[520px] rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
                {loading ? (
                  <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                    <div className="relative mb-6 flex size-24 items-center justify-center rounded-full border border-primary/30 bg-primary/8">
                      <Radar className="size-10 animate-pulse text-primary" />
                      <span className="absolute inset-0 animate-ping rounded-full border border-primary/20" />
                    </div>
                    <h3 className="text-xl font-semibold">Analyzing threat patterns</h3>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Checking persuasion tactics, identity signals, links, and phone reputation.
                    </p>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
                      <div className="score-orbit flex size-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-primary/15">
                        <span className="font-mono text-4xl font-bold">{result.riskScore}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Risk score
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskTone(result.riskLevel)}`}
                          >
                            {result.riskLevel} risk
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                            {result.scamType}
                          </span>
                        </div>
                        <h3 className="mt-3 text-2xl font-bold">Assessment complete</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          AI confidence:{" "}
                          <span className="font-semibold text-foreground">
                            {result.confidence}%
                          </span>
                        </p>
                      </div>
                    </div>

                    {result.phone && (
                      <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/12 p-2 text-primary">
                              <Phone className="size-4" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-semibold">
                                {result.phone.number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.phone.country} • {result.phone.carrierType}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${reputationTone(result.phone.reputation)}`}
                          >
                            {result.phone.reputation}
                          </span>
                        </div>
                        {result.phone.notes && (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {result.phone.notes}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <h4 className="result-label">
                          <AlertTriangle /> Red flags detected
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.redFlags.length ? (
                            result.redFlags.map((flag) => (
                              <span
                                key={flag}
                                className="rounded-lg border border-danger/20 bg-danger/7 px-3 py-2 text-xs text-danger"
                              >
                                {flag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No strong red flags found.
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="result-label">
                          <Sparkles /> AI explanation
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {result.explanation}
                        </p>
                      </div>
                      <div>
                        <h4 className="result-label">
                          <ShieldCheck /> Recommended action
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {result.recommendation}
                        </p>
                      </div>
                      <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/7 p-4">
                        <h4 className="result-label text-primary">
                          <Fingerprint /> Explain it like I'm 15
                        </h4>
                        <p className="mt-2 text-sm leading-6">{result.eli15}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex size-20 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
                      <ShieldCheck className="size-9" />
                    </div>
                    <h3 className="text-xl font-semibold">Your assessment appears here</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                      Submit a message, screenshot, URL, or phone number to see its risk score,
                      scam category, warning signs, and recommended next steps.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-xl">
              <p className="eyebrow">Built for clarity</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                From suspicious to understood.
              </h2>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
              {[
                [
                  Radar,
                  "01",
                  "Scan the signals",
                  "We inspect urgency, identity claims, requests, payment pressure, links, and phone metadata.",
                ],
                [
                  Fingerprint,
                  "02",
                  "Reason in context",
                  "The model weighs suspicious indicators against plausible, non-malicious explanations.",
                ],
                [
                  ShieldCheck,
                  "03",
                  "Act safely",
                  "You get practical next steps built around verification through trusted official channels.",
                ],
              ].map(([Icon, n, title, copy]) => {
                const FeatureIcon = Icon as typeof Radar;
                return (
                  <article key={String(n)} className="bg-card p-7">
                    <div className="flex items-center justify-between">
                      <FeatureIcon className="size-6 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">{String(n)}</span>
                    </div>
                    <h3 className="mt-8 text-lg font-semibold">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="history" className="border-t border-border bg-surface py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">On this device</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Recent analyses</h2>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem(HISTORY_KEY);
                    setHistory([]);
                  }}
                >
                  <Trash2 /> Clear
                </Button>
              )}
            </div>
            {history.length ? (
              <div className="grid gap-3">
                {history.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    onClick={() => loadHistory(entry)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-accent"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${riskTone(entry.riskLevel)}`}
                    >
                      <AlertTriangle className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{entry.scamType}</span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {entry.kind}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(entry.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{entry.input}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-mono text-xl font-bold">{entry.riskScore}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        risk
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Clock3 className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-4 font-medium">No analyses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest checks will be saved locally on this device.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-5 text-primary" /> ScamShield AI
          </div>
          <p className="text-center">Decision support, not a guarantee. When in doubt, verify independently.</p>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="#top" className="flex items-center gap-1 hover:text-foreground">
              Top <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
