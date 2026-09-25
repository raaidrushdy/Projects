// Shared between the client (input guidance) and the tailor API route
// (enforcement) so the two never drift apart.
//
// Lowered from 20,000: the tailor route generates a full rewritten LaTeX
// document, so input size drives generation time almost directly, and a
// near-cap resume was the exact worst case behind recurring Vercel
// timeouts. This shrinks the worst case further, on top of the effort/model
// and maxDuration changes in src/app/api/tailor/route.ts.
export const MAX_INPUT_CHARS = 14000;
