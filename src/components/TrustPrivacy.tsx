function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

const POINTS = [
  "Nothing you paste is stored once your result comes back, and none of it trains any model.",
  "Nothing is invented. Only the experience already on your resume gets reworded.",
  "Your formatting is preserved exactly, LaTeX included.",
];

export function TrustPrivacy() {
  return (
    <section id="privacy" className="flex scroll-mt-24 flex-col gap-4 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">Trust and privacy</h2>
      <ul className="flex flex-col gap-2.5">
        {POINTS.map((point) => (
          <li key={point} className="flex gap-2.5 text-sm text-muted">
            <CheckIcon />
            {point}
          </li>
        ))}
      </ul>
      <a
        href="/privacy"
        className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
      >
        Read the full privacy policy
      </a>
    </section>
  );
}
