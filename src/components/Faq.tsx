function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-precise group-open:rotate-180"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

const FAQ_ITEMS = [
  {
    q: "Does it make things up?",
    a: "No. It only rewords and reorders the experience already on your resume, matched to the job posting's language. It won't invent an employer, title, date, or metric you didn't give it.",
  },
  {
    q: "Does it keep my LaTeX formatting?",
    a: "Yes. The content is edited in place. Your document class, packages, and custom commands are left untouched.",
  },
  {
    q: "Is my data stored?",
    a: "No. Your resume and the job posting aren't stored once your tailored result comes back, and neither is used to train any model.",
  },
  {
    q: "What file types work?",
    a: "LaTeX (.tex) only. Paste your LaTeX source directly into the resume field, or upload a .tex file.",
  },
  {
    q: "Is it really free?",
    a: "Yes, for now. It's free while we're testing, with a per-browser cap so it doesn't run away in API costs. Message us if you hit it and want to keep going.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="flex scroll-mt-24 flex-col gap-4 border-t border-line pt-10">
      <h2 className="font-heading text-xl font-semibold tracking-tight">FAQ</h2>
      <div className="flex flex-col divide-y divide-line">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group py-4 first:pt-0">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-sm font-medium outline-none transition-colors duration-180 ease-precise hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronIcon />
            </summary>
            <p className="mt-2 text-sm text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
