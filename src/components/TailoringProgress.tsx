"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Reading your resume", after: 0 },
  { label: "Matching the job description", after: 4500 },
  { label: "Writing your cover letter", after: 13000 },
];

// The last step can sit "active" for the rest of the ~60s request with
// nothing else on screen moving — long enough to read as frozen. This
// surfaces after the last step has been active a while, so a slow request
// still looks alive instead of going quiet.
const LONG_WAIT_AFTER = 25000;

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
  const [showLongWait, setShowLongWait] = useState(false);

  useEffect(() => {
    const timers = STEPS.slice(1).map((step, i) => setTimeout(() => setStepIndex(i + 1), step.after));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowLongWait(true), LONG_WAIT_AFTER);
    return () => clearTimeout(timer);
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

      {showLongWait && (
        <p className="border-t border-line pt-4 text-xs text-muted">
          Still working — longer or more detailed resumes can take up to a minute.
        </p>
      )}
    </div>
  );
}
