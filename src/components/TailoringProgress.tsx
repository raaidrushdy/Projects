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

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

/** Client-timed step labels, not a real progress feed: the tailoring API
    returns one JSON blob at the end, nothing to stream. Rather than show
    all three steps up front with a plain spinner, this grows one line at a
    time as each step is reached, each with a mono elapsed timestamp — the
    shape of a deploy log, not a loading bar, since that's a closer match
    for what's actually happening (a sequence of real steps, not a knowable
    percentage). */
export function TailoringProgress() {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [completedAt, setCompletedAt] = useState<number[]>([]);
  const [showLongWait, setShowLongWait] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => setElapsedMs(Date.now() - start), 1000);
    const stepTimers = STEPS.slice(1).map((step, i) =>
      setTimeout(() => {
        setStepIndex(i + 1);
        setCompletedAt((prev) => [...prev, Date.now() - start]);
      }, step.after),
    );
    const longWaitTimer = setTimeout(() => setShowLongWait(true), LONG_WAIT_AFTER);

    return () => {
      clearInterval(tick);
      stepTimers.forEach(clearTimeout);
      clearTimeout(longWaitTimer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-1 rounded-3xl border border-line bg-panel p-8 sm:p-10"
    >
      {STEPS.map((step, i) => {
        if (i > stepIndex) return null;
        const isDone = i < stepIndex;

        return (
          <div key={step.label} className="animate-log-line flex items-center gap-3 py-1.5">
            <span
              key={isDone ? "done" : "active"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-precise ${
                isDone ? "animate-check-pop border-accent bg-accent text-accent-foreground" : "border-accent text-accent"
              }`}
            >
              {isDone ? <CheckIcon /> : <span className="step-pulse h-1.5 w-1.5 rounded-full bg-accent" />}
            </span>
            <span className={`flex-1 text-sm transition-colors duration-200 ${isDone ? "text-muted" : "text-foreground"}`}>
              {step.label}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted">
              {formatElapsed(isDone ? completedAt[i] : elapsedMs)}
            </span>
          </div>
        );
      })}

      {showLongWait && (
        <p className="animate-log-line mt-3 border-t border-line pt-3 text-xs text-muted">
          Still compiling. Bigger documents, bigger builds.
        </p>
      )}
    </div>
  );
}
