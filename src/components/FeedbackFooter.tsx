const FEEDBACK_EMAIL = "raaidrushdy@gmail.com";
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  "Resumate feedback",
)}`;

export function FeedbackFooter() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-10 text-center">
      <a
        href={FEEDBACK_MAILTO}
        className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        Something broken, or wish it did something else? Tell us.
      </a>
    </footer>
  );
}
