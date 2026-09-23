"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { MatchAnalysis } from "@/components/MatchAnalysis";
import { ResultCard } from "@/components/ResultCard";
import { ResumeField } from "@/components/ResumeField";
import { getRemaining, getServerRemaining, recordUse, subscribeToUsage } from "@/lib/usage";

interface TailorResult {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
  tailoredResume: string;
  coverLetter: string;
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
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
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.5c.35 3.1 1.1 5.1 2.25 6.25S17.4 10.65 20.5 11c-3.1.35-5.1 1.1-6.25 2.25S12.35 16.4 12 19.5c-.35-3.1-1.1-5.1-2.25-6.25S6.6 11.35 3.5 11c3.1-.35 5.1-1.1 6.25-2.25S11.65 5.6 12 2.5Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900" />
  );
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
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

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setResult(data as TailorResult);
      recordUse();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-12rem] h-[26rem] w-[45rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/50 via-sky-200/30 to-transparent blur-3xl dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16 sm:py-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <LogoMark />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Resumate</h1>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              Upload or paste your resume and a job posting — get a tailored resume and cover
              letter back in seconds.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Free while we&apos;re testing
          </span>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <ResumeField value={resume} onChange={setResume} />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Job description</span>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job posting you're applying to..."
                rows={12}
                className="w-full resize-y rounded-xl border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6 dark:border-white/10">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            >
              {loading ? <Spinner /> : <SparkleIcon />}
              {loading ? "Tailoring..." : "Tailor my resume"}
            </button>

            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {outOfFreeUses
                ? "You've hit today's usage cap on this browser."
                : `${remaining} free tailoring${remaining === 1 ? "" : "s"} left on this browser`}
            </span>
          </div>

          {outOfFreeUses && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Message us if you want to keep testing — we&apos;ll bump it up.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
        </form>

        {result && (
          <section className="flex flex-col gap-6">
            <MatchAnalysis
              matchScore={result.matchScore}
              missingKeywords={result.missingKeywords}
              redFlags={result.redFlags}
            />
            <ResultCard title="Tailored resume" text={result.tailoredResume} filename="tailored-resume.txt" />
            <ResultCard title="Cover letter" text={result.coverLetter} filename="cover-letter.txt" />
          </section>
        )}
      </div>
    </div>
  );
}
