"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Reading your resume", after: 0 },
  { label: "Matching the job description", after: 4500 },
  { label: "Writing your cover letter", after: 13000 },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

/** Client-timed step labels, not a real progress feed: the tailoring API
    returns one JSON blob at the end, nothing to stream. This gives a person
    something better to look at than a bare spinner during that wait without
    pretending to know the model's actual progress. */
export function TailoringProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timers = STEPS.slice(1).map((step, i) => setTimeout(() => setStepIndex(i + 1), step.after));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-4 rounded-3xl border border-line bg-panel p-8 sm:p-10"
    >
      {STEPS.map((step, i) => {
        const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                state === "done"
                  ? "border-accent bg-accent text-accent-foreground"
                  : state === "active"
                    ? "border-accent text-accent"
                    : "border-line text-muted"
              }`}
            >
              {state === "done" ? <CheckIcon /> : state === "active" ? <span className="step-pulse h-2 w-2 rounded-full bg-accent" /> : null}
            </span>
            <span className={`text-sm ${state === "pending" ? "text-muted" : "text-foreground"}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
