const FEEDBACK_EMAIL = "raaidrushdy@gmail.com";
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  "Redrafted feedback",
)}`;

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted sm:px-6 lg:max-w-4xl">
        <span className="font-display text-base tracking-tight text-foreground">Redrafted</span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a
            href={FEEDBACK_MAILTO}
            className="inline-flex min-h-11 items-center underline decoration-current/30 underline-offset-2 transition hover:text-foreground"
          >
            Contact us
          </a>
          <a
            href="#privacy"
            className="inline-flex min-h-11 items-center underline decoration-current/30 underline-offset-2 transition hover:text-foreground"
          >
            Privacy
          </a>
        </div>
        <p>Built by Raaid</p>
      </div>
    </footer>
  );
}
