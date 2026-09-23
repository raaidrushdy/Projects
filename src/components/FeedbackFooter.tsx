const FEEDBACK_EMAIL = "raaidrushdy@gmail.com";
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  "Redrafted feedback",
)}`;

export function FeedbackFooter() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-10 text-center">
      <a
        href={FEEDBACK_MAILTO}
        className="text-sm text-muted underline decoration-current/30 underline-offset-2 transition hover:text-foreground"
      >
        Something broken, or wish it did something else? Tell us.
      </a>
    </footer>
  );
}
