# Resumate

Paste your resume and a job posting, get back a resume tailored to that job plus a
matching cover letter — in seconds.

## Why

Tailoring a resume to every job posting is tedious but it meaningfully improves response
rates, so people either skip it or spend an hour doing it by hand. Resumate automates the
rewrite with Claude: it reorders and rephrases your existing experience to match the
posting's language, without inventing new facts.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Claude API (`@anthropic-ai/sdk`) for the resume/cover-letter generation
- Free tier tracked client-side (3 free tailorings); paid/unlimited tier is not wired up
  yet — see "Monetization" below

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Anthropic API key
   (get one at https://console.anthropic.com/):

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## How it works

- `src/app/page.tsx` — the UI: two textareas (resume, job description), a submit button,
  and a results view with copy/download for the tailored resume and cover letter.
- `src/app/api/tailor/route.ts` — server route that calls the Claude API and returns
  `{ tailoredResume, coverLetter }` as JSON.
- `src/lib/usage.ts` — tracks free-tier usage in `localStorage` (resets if storage is
  cleared; this is a placeholder, not a real entitlement system).

## Monetization (not yet implemented)

The plan is freemium: 3 free tailorings, then a paid subscription for unlimited use.
The free-tier counter above is a client-side stub for demo purposes. To make this real:

- Add auth (e.g. NextAuth) so usage limits can't be reset by clearing `localStorage`
- Add Stripe Checkout + a webhook to grant subscription status
- Move the usage counter server-side (e.g. a database row per user)

## Deploying

Any Next.js host works (Vercel is the easiest). Set `ANTHROPIC_API_KEY` as an
environment variable on the host — do not commit it.
