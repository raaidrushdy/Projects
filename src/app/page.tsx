"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  FREE_TIER_LIMIT,
  getRemaining,
  getServerRemaining,
  recordUse,
  subscribeToUsage,
} from "@/lib/usage";

interface TailorResult {
  tailoredResume: string;
  coverLetter: string;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Resumate</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Paste your resume and a job posting. Get a tailored resume and cover letter in
          seconds.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Your resume</span>
            <textarea
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="Paste your current resume text here..."
              rows={12}
              className="w-full resize-y rounded-lg border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job posting you're applying to..."
              rows={12}
              className="w-full resize-y rounded-lg border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {loading ? "Tailoring..." : "Tailor my resume"}
          </button>

          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {outOfFreeUses
              ? "You've used all your free tailorings."
              : `${remaining} of ${FREE_TIER_LIMIT} free tailorings left`}
          </span>
        </div>

        {outOfFreeUses && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            You&apos;re out of free tailorings. Unlimited access via subscription is coming
            soon — check back shortly.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}
      </form>

      {result && (
        <section className="flex flex-col gap-6 border-t border-black/10 pt-8 dark:border-white/15">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Tailored resume</h2>
              <div className="flex gap-2">
                <CopyButton text={result.tailoredResume} label="Copy" />
                <button
                  type="button"
                  onClick={() => downloadTextFile("tailored-resume.txt", result.tailoredResume)}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-black/5 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm dark:border-white/15 dark:bg-white/[0.03]">
              {result.tailoredResume}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Cover letter</h2>
              <div className="flex gap-2">
                <CopyButton text={result.coverLetter} label="Copy" />
                <button
                  type="button"
                  onClick={() => downloadTextFile("cover-letter.txt", result.coverLetter)}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-black/5 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm dark:border-white/15 dark:bg-white/[0.03]">
              {result.coverLetter}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}
