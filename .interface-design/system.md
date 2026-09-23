# Design System

## Direction

**Personality:** Utility & Function, with a document-first sensibility — the app itself stays quiet (muted, borders-only) so the resume/cover-letter output can read as the one thing that matters.

**Foundation:** Warm neutral (light: `#f7f6f3` background, not stark white/gray) / cool neutral (dark: `#0d0f12`), tinted by a single green accent used only for primary actions, the badge, and focus rings — never as decoration.

**Depth:** Borders-only + three-tier surface tonality, not shadows. `background` (page) → `panel` (the workspace card wrapping the inputs) → `surface` (the inputs themselves, and standalone result cards — the brightest, "paper" tone). `shadow-sm` appears sparingly on cards/inputs, never stacked.

## Tokens

### Spacing
Base: 4px (Tailwind default scale)
Scale in use: 8, 12, 16, 24, 32, 40 (`gap-2/4/6/8/10`, `p-3/4/6/8`)
Responsive: padding steps up at `sm:`/`lg:` rather than staying fixed (e.g. card `p-4 sm:p-6 lg:p-8`), so it doesn't collapse edge-to-edge on narrow mobile widths.

### Colors
```
Light
--background: #f7f6f3
--panel:      #eeece5
--surface:    #ffffff
--foreground: #1a1a18
--muted:      #6b6b66
--line:       #e2e0da
--accent:            #3f7d5c
--accent-foreground: #ffffff
--score-high: #2f7a4f
--score-mid:  #b8860b
--score-low:  #b3402e

Dark
--background: #0d0f12
--panel:      #17191d
--surface:    #1f2226
--foreground: #e8e8e6
--muted:      #9a9a96
--line:       #2a2c30
--accent:            #5fa87a
--accent-foreground: #0d0f12
--score-high: #4fa571
--score-mid:  #d6a33d
--score-low:  #d97862
```
Manual `:root[data-theme]` toggle, not `prefers-color-scheme`/Tailwind `dark:` — lets a manual override win over the OS setting. `muted`-on-`panel` is tuned to stay just above WCAG AA (4.53:1 in light mode); don't darken `panel` further without re-checking that.

### Radius
Scale: `rounded-lg` (8px, buttons/inputs) · `rounded-xl` (12px, textareas/inner panels) · `rounded-2xl` (16px, logo mark) · `rounded-3xl` (24px, the main workspace card) · `rounded-full` (pills, primary button, badge)

### Typography
- Sans — **Manrope** (`--font-sans`): app chrome, labels, buttons, body text.
- Serif — **Source Serif 4** (`--font-serif`): the tailored resume/cover-letter output only — the one place the app should read as a document about to be submitted, not UI.
- Display — **Fredoka**, weight 600 (`--font-display`): the wordmark only — one place for personality, not spread across the UI.
- Fallback chains (safety net beyond next/font's generated local fallback): `--font-sans` → `system-ui, sans-serif`; `--font-serif` → `Georgia, serif`; `--font-display` → `system-ui, sans-serif`.
- Scale: 12 (`text-xs`), 14 (`text-sm`), **16 (`text-base`) is the floor for any real input** — smaller triggers iOS Safari's auto-zoom-on-focus — 18–20 (score circle, card titles), 30/36/48 (`text-3xl`/`text-4xl`/`text-5xl`, responsive H1).
- Weights: 400 body, 500 medium (labels), 600 semibold (buttons, headings).

## Patterns

### Button Primary (e.g. "Tailor my resume")
- `rounded-full`, `bg-accent` / `text-accent-foreground`
- Padding: `px-6 py-2.5`
- Min height: `min-h-11` (44px — Apple HIG tap-target floor)
- Font: `text-sm font-semibold`
- Disabled: `opacity-40`, `cursor-not-allowed`

### Button Secondary (Copy / Download)
- `rounded-lg`, `border border-line`
- Padding: `px-3 py-1.5`, `min-h-11`
- Font: `text-sm font-medium`, `text-muted`
- Hover: `bg-foreground/5` (not raw black/white opacity — adapts via the token system in both themes)

### Icon Button (theme toggle)
- `h-11 w-11` (44×44px exactly), `rounded-lg border border-line`

### Input (job description textarea, resume field)
- `rounded-xl`, `bg-surface`, `shadow-sm`
- `text-base` (16px, never smaller)
- Focus: `focus:ring-2 focus:ring-accent/40`

### Card (main workspace form)
- `rounded-3xl`, `border border-line`, `bg-panel`, `shadow-sm`
- Padding steps: `p-4 sm:p-6 lg:p-8`

### Result Card (tailored resume / cover letter text)
- `rounded-md`, `border border-line`, `bg-surface`, `p-5`
- `font-serif` for prose output, `font-mono` when the content is LaTeX source

### Responsive
- Two-field layout stacks single-column below `md:` (768px, not Tailwind's default 640px — 640 felt cramped in testing) with a horizontal divider; side-by-side at `md:`+ with a vertical divider.
- Container widens (`lg:max-w-4xl`) at `lg:` (1024px) so it doesn't feel cramped on 13" laptop screens.
- Every interactive element (buttons, links, the theme toggle) enforces `min-h-11`/`h-11` — 44×44px minimum tap target — regardless of viewport.
- `html`/`body` use `100dvh` (with a `100vh` fallback) instead of percentage heights, for Safari's dynamic toolbar. `scrollbar-gutter: stable` on `html` so Windows' visible scrollbar doesn't shift layout width relative to Mac.

## Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Warm off-white background (`#f7f6f3`) over stark white/gray | Reads as paper, not generic SaaS gray — fits a tool whose output is a document | 2026-09-23 |
| Three-tier surface tonality instead of shadows | Keeps the flat/document aesthetic; avoids the drop-shadow "AI slop" look | 2026-09-23 |
| Single accent color, reserved for primary actions/badge/focus | Color as signal, not decoration — keeps hierarchy legible | 2026-09-23 |
| Manual `data-theme` toggle, no Tailwind `dark:` variants | `dark:` defaults to `prefers-color-scheme`, which would silently fight a manual override | 2026-09-23 |
| Resume field styled as a code editor (monospace, line-number gutter) | Pasted resumes are often LaTeX source; signals "raw text/code welcome," not just prose | 2026-09-23 |
| Serif font reserved for tailored resume/cover-letter output only | The one place the app should read as a real document, not app chrome | 2026-09-23 |
| Fredoka reserved for the wordmark only | One place for personality; keeps the rest of the UI quiet | 2026-09-23 |
| 44×44px minimum tap targets everywhere interactive | Apple HIG floor — the app is used on mobile Safari | 2026-09-23 |
| 768px/1024px breakpoints instead of Tailwind's default 640px | The two-field grid felt cramped below 768px in real-device testing | 2026-09-23 |
