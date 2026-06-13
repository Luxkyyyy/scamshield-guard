# ScamShield AI

**Think Before You Click.** ScamShield AI is a responsive hackathon-ready scam detection application for messages, emails, social posts, and suspicious URLs.

## Features

- AI-powered scam classification and risk scoring
- Structured red flags, explanation, recommendation, and confidence
- Plain-language “Explain Like I’m 15” summary
- Message and URL analysis modes
- Recent analyses stored locally in the browser
- Responsive cybersecurity interface using the supplied brand artwork

## Stack

- TanStack Start, React 19, Vite, Tailwind CSS v4
- Lovable AI Gateway via the Vercel AI SDK
- Lovable Cloud backend infrastructure
- Zod validation on both client and server

## Local setup

1. Install dependencies: `bun install`
2. Copy `.env.example` to `.env`
3. Provide `LOVABLE_API_KEY` through your secure environment (Lovable manages this automatically in hosted environments)
4. Start development: `bun run dev`

## API

`POST /api/analyze`

```json
{ "message": "Your account is locked. Verify now at http://example.test" }
```

The endpoint validates input, asks the model for schema-constrained output, validates the response again, and returns a consistent risk assessment. It never follows or visits submitted URLs.

## Safety and reliability

ScamShield is decision support, not a guarantee. The model is instructed to treat submitted text as untrusted evidence, ignore instructions embedded inside it, avoid claiming certainty, and recommend official verification channels. Users should never share passwords, one-time codes, recovery phrases, or payment details.