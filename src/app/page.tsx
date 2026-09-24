"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { parseJsonResponse } from "@/lib/api";
import { MatchAnalysis } from "@/components/MatchAnalysis";
import { ResultCard } from "@/components/ResultCard";
import { ResumeField } from "@/components/ResumeField";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getRemaining, getServerRemaining, recordUse, subscribeToUsage } from "@/lib/usage";

interface TailorResult {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
  tailoredResume: string;
  coverLetter: string;
  isLatex: boolean;
}

const GENERIC_ERROR = "The tailoring request failed. Try again in a moment.";

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4M9 12h6M9 15h6M9 9h2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 2.5c.35 3.1 1.1 5.1 2.25 6.25S17.4 10.65 20.5 11c-3.1.35-5.1 1.1-6.25 2.25S12.35 16.4 12 19.5c-.35-3.1-1.1-5.1-2.25-6.25S6.6 11.35 3.5 11c3.1-.35 5.1-1.1 6.25-2.25S11.65 5.6 12 2.5Z" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />;
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  // Snapshot of the resume text a result was drafted from — kept separate
  // from the live `resume` field so the redline view stays correct even if
  // the user edits the field again after a result comes back.
  const [submittedResume, setSubmittedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = useSyncExternalStore(subscribeToUsage, getRemaining, getServerRemaining);

  const outOfFreeUses = remaining <= 0;
  const canSubmit =
    resume.trim().length > 0 && jobDescription.trim().length > 0 && !loading && !outOfFreeUses;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);
    const resumeAtSubmit = resume;

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeAtSubmit, jobDescription }),
      });
      const data = (await parseJsonResponse(response)) as Partial<TailorResult> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? GENERIC_ERROR);
      }

      setResult(data as TailorResult);
      setSubmittedResume(resumeAtSubmit);
      recordUse();
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:max-w-4xl lg:py-20">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <LogoMark />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
              Redrafted
            </h1>
            <p className="mx-auto max-w-md text-muted">
              Upload or paste your resume and a job posting — get a tailored resume and cover
              letter back in seconds.
            </p>
          </div>
          <span className="rounded-full border border-accent/30 px-3 py-1 text-xs font-medium text-accent">
            Free while we&apos;re testing
          </span>
        </header>

        <main className="contents">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-line bg-panel p-4 shadow-sm sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
            <div className="min-w-0 flex-1">
              <ResumeField value={resume} onChange={setResume} />
            </div>

            {/* Horizontal on mobile (stacked column), vertical once the
                fields sit side by side at md: and up. */}
            <div aria-hidden="true" className="h-px w-full bg-line md:h-auto md:w-px" />

            <label className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-sm font-medium">
                Job description <span className="text-muted">(required)</span>
              </span>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job posting you're applying to..."
                rows={12}
                required
                className="w-full resize-y rounded-xl bg-surface p-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Spinner /> : <SparkleIcon />}
              {loading ? "Tailoring..." : "Tailor my resume"}
            </button>

            <span className="text-sm text-muted">
              {outOfFreeUses
                ? "You've hit today's usage cap on this browser."
                : `${remaining} free tailoring${remaining === 1 ? "" : "s"} left on this browser`}
            </span>
          </div>

          {outOfFreeUses && (
            <div
              role="status"
              className="rounded-xl border border-score-mid/40 bg-score-mid/10 p-4 text-sm text-score-mid"
            >
              Message us if you want to keep testing — we&apos;ll bump it up.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-score-low/40 bg-score-low/10 p-4 text-sm text-score-low"
            >
              {error}
            </div>
          )}
        </form>

        {result && (
          <section className="animate-reveal flex flex-col gap-6">
            <MatchAnalysis
              matchScore={result.matchScore}
              missingKeywords={result.missingKeywords}
              redFlags={result.redFlags}
            />
            <ResultCard
              title="Tailored resume"
              text={result.tailoredResume}
              filename={result.isLatex ? "tailored-resume.tex" : "tailored-resume.txt"}
              monospace={result.isLatex}
              note={result.isLatex ? "LaTeX source — paste into Overleaf or compile locally." : undefined}
              originalText={submittedResume}
              primary
            />
            <ResultCard title="Cover letter" text={result.coverLetter} filename="cover-letter.txt" />
          </section>
        )}
        </main>
      </div>
    </div>
  );
}
