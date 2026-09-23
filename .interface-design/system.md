# Design System

## Direction

**Personality:** The editor's desk — an editorial/document sensibility, not a SaaS dashboard. The app itself stays quiet (muted, borders-only) so the resume/cover-letter output can read as the one thing that matters, and the tailoring process itself is shown, not just asserted.

**Foundation:** Paper/ink neutral (light: `#f6f2ea` background, manila-tan `panel`, warm ivory `surface`) / dark study (dark: `#141210`), tinted by a single deep stamp-ink indigo accent used only for primary actions, the badge, and focus rings — never as decoration — plus one second color, correction-red, reserved *exclusively* for the redline "removed" mark (never elsewhere, so it can't be confused with the unrelated score-low semantic color).

**Depth:** Borders-only + three-tier surface tonality, not shadows. `background` (page) → `panel` (the workspace card wrapping the inputs) → `surface` (the inputs themselves, and standalone result cards — the brightest, "paper" tone). `shadow-sm` appears sparingly on cards/inputs, never stacked.

**Signature:** the tailored resume can be viewed as a redline — struck-through removed phrasing in correction-red, underlined inserted phrasing in the accent — via a "Show changes" toggle (`RedlineView.tsx`, word-level diff in `lib/diff.ts`). This is the one thing only this product could have: it shows the tailoring happening instead of just handing over a finished swap.

## Tokens

### Spacing
Base: 4px (Tailwind default scale)
Scale in use: 8, 12, 16, 24, 32, 40 (`gap-2/4/6/8/10`, `p-3/4/6/8`)
Responsive: padding steps up at `sm:`/`lg:` rather than staying fixed (e.g. card `p-4 sm:p-6 lg:p-8`), so it doesn't collapse edge-to-edge on narrow mobile widths.

### Colors
```
Light
--background:     #f6f2ea
--panel:          #ece4d3
--surface:        #fffdf8
--foreground:     #221f1a
--muted:          #6b655e
--line:           #ddd3bf
--accent:            #2d3b6b
--accent-foreground: #ffffff
--redline-remove: #a13f35
--score-high: #2a6d47
--score-mid:  #7e5c08
--score-low:  #a93c2b

Dark
--background:     #141210
--panel:          #1e1b17
--surface:        #28241f
--foreground:     #efe9df
--muted:          #a39a8d
--line:           #3a352d
--accent:            #8b9de0
--accent-foreground: #141210
--redline-remove: #e08b76
--score-high: #4fa571
--score-mid:  #d6a33d
--score-low:  #d97862
```
Manual `:root[data-theme]` toggle, not `prefers-color-scheme`/Tailwind `dark:` — lets a manual override win over the OS setting. Every pairing above (including `text-*` on its own `/10`-tinted background, the pattern the usage-cap/error banners and the redline marks actually use) is contrast-checked to clear WCAG AA — don't move a color without recomputing against that tinted pairing, not just the plain surface.

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
- When an `originalText` is available (the tailored resume, not the cover letter — a cover letter has no "before"), a "Show changes" toggle switches the pane to `RedlineView`: same card chrome, but removed words are `text-redline-remove line-through opacity-75` and inserted words are `text-accent font-semibold underline`. Not offered for LaTeX output (diffing source isn't the point; the existing monospace view already treats it as code).

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
| Repalette: SaaS-green → editorial paper/ink/stamp-indigo | The green+cream combo read as generic "wellness SaaS"; the product's own domain (editing, red-lining, tailoring) gives a more specific world to draw from — confirmed with the user via a rendered direction board before building | 2026-09-23 |
| Redline diff as the results signature, not a plain text swap | Shows the tailoring happening instead of just asserting it — the one thing only this product could have | 2026-09-23 |
| Word-level diff tokenizes "word + trailing whitespace" as one unit, not word/space separately | A separate whitespace token is generic enough that LCS matches it to *any* other space in the document, not the visually adjacent one — silently swallowing spacing between del/ins runs. Caught via a rendered screenshot before shipping. | 2026-09-23 |
