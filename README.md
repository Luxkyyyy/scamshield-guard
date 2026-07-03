# ScamShield AI

**Think Before You Click.** ScamShield AI is a responsive hackathon-ready scam detection application for messages, emails, social posts, suspicious URLs, screenshots, and phone numbers.

## Features

- AI-powered scam classification and risk scoring
- Structured red flags, explanation, recommendation, and confidence
- Plain-language “Explain Like I’m 15” summary
- Message, URL, screenshot, and phone analysis modes
- Netlify-ready AI endpoint with `GEMINI_API_KEY`, optional Lovable AI, and a rules-based fallback
- Recent analyses stored locally in the browser
- Responsive cybersecurity interface using the supplied brand artwork

## Stack

- React 19, TypeScript, Vite, Tailwind CSS v4
- Netlify Functions for the secure AI endpoint
- Google Gemini API on Netlify, optional Lovable AI Gateway in Lovable
- Zod validation on both client and server

## Local setup

1. Install dependencies: `bun install`
2. Install the Netlify CLI: `npm install -g netlify-cli`
3. Create a local `.env` with `GEMINI_API_KEY=...`
4. Start the full app and function locally: `netlify dev`

## Deploy to Netlify

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Netlify reads `netlify.toml`; the build command is `bun run build` and publish directory is `dist`.
4. Add `GEMINI_API_KEY` under **Site configuration → Environment variables** with scope **Functions**.
5. Trigger **Clear cache and deploy site**. `/api/analyze` is automatically routed to the Netlify Function.

Get a free Gemini key from Google AI Studio. Never expose `GEMINI_API_KEY` or `LOVABLE_API_KEY` through a `VITE_` variable; those values are bundled into browser code.

If no AI key is configured, ScamShield still works with a built-in rules-based scanner so the deployed demo does not show “AI is not configured.” Screenshot OCR requires `GEMINI_API_KEY` or `LOVABLE_API_KEY`.

## API

`POST /api/analyze`

```json
{ "message": "Your account is locked. Verify now at http://example.test" }
```

The endpoint validates input, uses Gemini/Lovable AI when configured, falls back to a local scam-rule scanner when no key is available, validates the response again, and returns a consistent risk assessment. It never follows or visits submitted URLs.

## Safety and reliability

ScamShield is decision support, not a guarantee. The model is instructed to treat submitted text as untrusted evidence, ignore instructions embedded inside it, avoid claiming certainty, and recommend official verification channels. Users should never share passwords, one-time codes, recovery phrases, or payment details.
