"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { parseJsonResponse } from "@/lib/api";
import { EXAMPLE_JOB_DESCRIPTION, EXAMPLE_RESUME } from "@/lib/example";
import { Faq } from "@/components/Faq";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { JobDescriptionField } from "@/components/JobDescriptionField";
import { ResultsTabs } from "@/components/ResultsTabs";
import { ResumeField } from "@/components/ResumeField";
import { TailoringProgress } from "@/components/TailoringProgress";
import { TrustPrivacy } from "@/components/TrustPrivacy";
import { getRemaining, getServerRemaining, recordUse, subscribeToUsage } from "@/lib/usage";
import { MAX_INPUT_CHARS } from "@/lib/limits";

interface TailorResult {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
  tailoredResume: string;
  coverLetter: string;
}

const GENERIC_ERROR = "The tailoring request failed. Try again in a moment.";

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 2.5c.35 3.1 1.1 5.1 2.25 6.25S17.4 10.65 20.5 11c-3.1.35-5.1 1.1-6.25 2.25S12.35 16.4 12 19.5c-.35-3.1-1.1-5.1-2.25-6.25S6.6 11.35 3.5 11c3.1-.35 5.1-1.1 6.25-2.25S11.65 5.6 12 2.5Z" />
    </svg>
  );
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
  const overLength = resume.length > MAX_INPUT_CHARS || jobDescription.length > MAX_INPUT_CHARS;
  const canSubmit =
    resume.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    !loading &&
    !outOfFreeUses &&
    !overLength;

  async function runTailoring() {
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void runTailoring();
  }

  function loadExample() {
    setResume(EXAMPLE_RESUME);
    setJobDescription(EXAMPLE_JOB_DESCRIPTION);
  }

  function startOver() {
    setResume("");
    setJobDescription("");
    setResult(null);
    setSubmittedResume("");
    setError(null);
  }

  return (
    <>
      <Header />
      <div className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 lg:max-w-4xl">
          {!result && (
            <div id="top" className="flex scroll-mt-24 flex-col items-center gap-3 pt-2 text-center">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Your LaTeX resume, rewritten for every job.
              </h1>
              <p className="max-w-md text-muted sm:text-lg">
                Paste your .tex resume and the job posting. Get a tailored resume and cover
                letter back in seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-accent/30 px-3 py-1 text-xs font-medium text-accent">
                  Free while we&apos;re testing
                </span>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
                  Built for LaTeX resumes
                </span>
              </div>
            </div>
          )}

        <main className="contents">
        {loading && <TailoringProgress />}

        {!loading && result && (
          <ResultsTabs
            matchScore={result.matchScore}
            missingKeywords={result.missingKeywords}
            redFlags={result.redFlags}
            tailoredResume={result.tailoredResume}
            coverLetter={result.coverLetter}
            originalResume={submittedResume}
            onStartOver={startOver}
          />
        )}

        {!loading && !result && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-3xl border border-line bg-panel p-4 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
              <div className="min-w-0 flex-1">
                <ResumeField value={resume} onChange={setResume} onLoadExample={loadExample} />
              </div>

              {/* Horizontal on mobile (stacked column), vertical once the
                  fields sit side by side at md: and up. */}
              <div aria-hidden="true" className="h-px w-full bg-line md:h-auto md:w-px" />

              <div className="min-w-0 flex-1">
                <JobDescriptionField value={jobDescription} onChange={setJobDescription} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SparkleIcon />
                Tailor my resume
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
                className="rounded-xl border border-line bg-surface p-4 text-sm text-foreground"
              >
                Message us if you want to keep testing. We&apos;ll bump it up.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-score-low/40 bg-score-low/10 p-4 text-sm text-score-low"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => void runTailoring()}
                  disabled={!canSubmit}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-score-low/40 px-3 py-1.5 text-sm font-medium transition hover:bg-score-low/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Retry
                </button>
              </div>
            )}
          </form>
        )}
        </main>

        <HowItWorks />
        <TrustPrivacy />
        <Faq />
        </div>
      </div>
    </>
  );
}
