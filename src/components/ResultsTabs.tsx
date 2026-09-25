"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { MatchAnalysis } from "@/components/MatchAnalysis";
import { RedlineView } from "@/components/RedlineView";
import { downloadTextFile } from "@/lib/download";

type TabId = "resume" | "cover-letter" | "changes";

const TABS: { id: TabId; label: string }[] = [
  { id: "resume", label: "Tailored resume" },
  { id: "cover-letter", label: "Cover letter" },
  { id: "changes", label: "Changes" },
];

interface ResultsTabsProps {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
  tailoredResume: string;
  coverLetter: string;
  originalResume: string;
  onStartOver: () => void;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v12m0 0 4-4m-4 4-4-4M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6v6M10 14 20 4"
      />
    </svg>
  );
}

/** Opens the tailored LaTeX in Overleaf via Overleaf's documented
    "Open in Overleaf" form POST (https://www.overleaf.com/how-to/open_in_overleaf) —
    no hosting or compilation needed on our end, and it's the fastest way for
    someone to see the tailored resume actually render before they commit to it. */
function OpenInOverleafButton({ tex }: { tex: string }) {
  return (
    <form action="https://www.overleaf.com/docs" method="post" target="_blank">
      <input type="hidden" name="snip" value={tex} />
      <input type="hidden" name="snip_name" value="tailored-resume.tex" />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5"
      >
        <ExternalLinkIcon />
        Open in Overleaf
      </button>
    </form>
  );
}

/** Score + missing-keyword count + a link into the Changes tab. Replaces
    the old full-size match-score block as the default, always-visible
    summary; the full detail (score circle, keyword chips, red flags) now
    lives inside the Changes tab. Neutral/indigo only — no score-banded
    color, on purpose.

    The count is phrased as "N keywords worked in", not a fraction of
    itself (missingKeywords is both the numerator and denominator there,
    so an "X of Y" framing always reads 100% and says nothing). */
function SummaryBar({
  matchScore,
  missingKeywords,
  onViewMissingKeywords,
}: {
  matchScore: number;
  missingKeywords: string[];
  onViewMissingKeywords: () => void;
}) {
  const total = missingKeywords.length;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm">
      <span className="font-semibold tabular-nums text-foreground">
        {matchScore}
        <span className="font-normal text-muted"> / 100 match</span>
      </span>
      <span aria-hidden="true" className="h-4 w-px bg-line" />
      <span className="text-muted">
        {total > 0
          ? `${total} missing keyword${total === 1 ? "" : "s"} worked in`
          : "No key skills were missing"}
      </span>
      {total > 0 && (
        <>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <button
            type="button"
            onClick={onViewMissingKeywords}
            className="inline-flex min-h-11 items-center font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
          >
            View missing keywords
          </button>
        </>
      )}
    </div>
  );
}

export function ResultsTabs({
  matchScore,
  missingKeywords,
  redFlags,
  tailoredResume,
  coverLetter,
  originalResume,
  onStartOver,
}: ResultsTabsProps) {
  const [tab, setTab] = useState<TabId>("resume");
  const [coverLetterDraft, setCoverLetterDraft] = useState(coverLetter);

  function viewMissingKeywords() {
    setTab("changes");
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .getElementById("missing-keywords")
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  return (
    <section className="animate-reveal flex flex-col gap-6">
      {/* The hero (and its page h1) is hidden once results exist, so this
          keeps exactly one h1 on the page for screen-reader/document-outline
          purposes without reintroducing a visible page title. */}
      <h1 className="sr-only">Your tailored results</h1>
      <SummaryBar matchScore={matchScore} missingKeywords={missingKeywords} onViewMissingKeywords={viewMissingKeywords} />

      <div
        role="tablist"
        aria-label="Result sections"
        className="grid grid-cols-3 gap-1 rounded-full border border-line bg-panel p-1 sm:inline-flex sm:w-fit"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent/50 sm:px-4 ${
              tab === t.id ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resume" && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Tailored resume</h2>
            <div className="flex flex-wrap justify-end gap-2">
              <CopyButton text={tailoredResume} label="Copy LaTeX" />
              <button
                type="button"
                onClick={() => downloadTextFile("tailored-resume.tex", tailoredResume)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5"
              >
                <DownloadIcon />
                Download .tex
              </button>
              <OpenInOverleafButton tex={tailoredResume} />
            </div>
          </div>

          <pre
            tabIndex={0}
            className="h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 font-mono text-sm leading-relaxed shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {tailoredResume}
          </pre>
        </div>
      )}

      {tab === "cover-letter" && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Cover letter</h2>
            <CopyButton text={coverLetterDraft} label="Copy" />
          </div>
          <textarea
            value={coverLetterDraft}
            onChange={(event) => setCoverLetterDraft(event.target.value)}
            aria-label="Cover letter, editable"
            tabIndex={0}
            className="h-[32rem] w-full resize-y rounded-md border border-line bg-surface p-5 font-serif text-sm leading-relaxed shadow-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      )}

      {tab === "changes" && (
        <div role="tabpanel" className="flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-panel p-4 sm:p-5">
            <MatchAnalysis matchScore={matchScore} missingKeywords={missingKeywords} redFlags={redFlags} />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">What changed</h2>
            <RedlineView before={originalResume} after={tailoredResume} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onStartOver}
        className="inline-flex min-h-11 w-fit items-center text-sm text-muted underline decoration-current/30 underline-offset-2 transition hover:text-foreground"
      >
        Start over
      </button>
    </section>
  );
}
