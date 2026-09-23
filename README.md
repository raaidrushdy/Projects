# Redrafted

Upload or paste your resume and a job posting, get back a resume tailored to that job
plus a matching cover letter — in seconds.

## Why

Tailoring a resume to every job posting is tedious but it meaningfully improves response
rates, so people either skip it or spend an hour doing it by hand. Redrafted automates the
rewrite with Claude: it reorders and rephrases your existing experience to match the
posting's language, without inventing new facts.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Claude API (`@anthropic-ai/sdk`) for the resume/cover-letter generation
- Currently **free for everyone** while we test — no billing wired up yet, see
  "Monetization" below

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

- `src/app/page.tsx` — the UI: a resume field (drag-and-drop upload or paste), a job
  description textarea, a submit button, and a results view with copy/download for the
  tailored resume and cover letter.
- `src/components/ResumeField.tsx` — the resume input: drag-and-drop or click-to-browse
  file upload (PDF, `.docx`, `.tex`/`.txt`), falling back to a plain paste-in textarea.
- `src/app/api/extract-resume/route.ts` — server route that extracts plain text from an
  uploaded PDF (`pdf-parse`) or Word doc (`mammoth`); `.tex`/`.txt` files are read as-is.
- `src/app/api/tailor/route.ts` — server route that calls the Claude API and returns
  `{ tailoredResume, coverLetter, isLatex, ... }` as JSON. When the resume text is
  detected as LaTeX source (`src/lib/latex.ts`), the model edits it in place — preserving
  the document's structure/packages/commands and returning valid, compilable LaTeX —
  instead of flattening it to plain text. There's no server-side LaTeX compilation; the
  output is source the user pastes into Overleaf or compiles locally.
- `src/lib/usage.ts` — tracks usage in `localStorage` per browser, purely as a sanity
  cap against runaway API cost (resets if storage is cleared; not an entitlement system).
- `src/app/globals.css` + `src/lib/theme.ts` + `src/components/ThemeToggle.tsx` — the
  light/dark theme system. Colors are CSS variables keyed off `:root[data-theme]`;
  `THEME_INIT_SCRIPT` runs in `<head>` before first paint (localStorage, else
  `prefers-color-scheme`) so there's no flash of the wrong theme, and the toggle persists
  a manual override the same way. One `--accent` token per theme is the only color used
  for primary actions/badge/focus — everything else is background/surface/foreground/
  muted/border/score-*.

## Monetization (not yet implemented)

The app is free for everyone right now, on purpose, while we validate that people
actually want it. Since it runs on your own Anthropic API key, every generation costs
you money even though users don't pay — don't blast the link to a huge audience until
billing is in place. Eventual plan: freemium, with a paid subscription for unlimited use.
To make that real:

- Add auth (e.g. NextAuth) so usage limits can't be reset by clearing `localStorage`
- Add Stripe Checkout + a webhook to grant subscription status
- Move the usage counter server-side (e.g. a database row per user)

## Deploying

Any Next.js host works (Vercel is the easiest). Set `ANTHROPIC_API_KEY` as an
environment variable on the host — do not commit it.
