const STEPS = [
  { n: "01", text: "Paste your resume." },
  { n: "02", text: "Add the job description." },
  { n: "03", text: "Get your tailored resume." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="flex scroll-mt-24 flex-col gap-6 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="flex items-start gap-3">
            <span className="font-mono text-sm text-accent">{step.n}</span>
            <p className="whitespace-nowrap text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
