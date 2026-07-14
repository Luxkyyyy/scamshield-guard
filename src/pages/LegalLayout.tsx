import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5 text-primary" /> ScamShield AI
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to app
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="legal-prose mt-10 space-y-8 text-[15px] leading-7 text-muted-foreground">
          {children}
        </div>
        <p className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          This page is maintained by the ScamShield AI team. It describes the practices of this
          application and is not legal advice.
        </p>
      </main>
    </div>
  );
}
