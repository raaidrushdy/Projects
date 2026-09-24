"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { MatchAnalysis } from "@/components/MatchAnalysis";
import { RedlineView } from "@/components/RedlineView";
import { downloadTextFile, downloadUrl } from "@/lib/download";
import { compileLatexToPdf } from "@/lib/pdftexEngine";

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
  isLatex: boolean;
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

type PdfState =
  | { status: "compiling" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export function ResultsTabs({
  matchScore,
  missingKeywords,
  redFlags,
  tailoredResume,
  coverLetter,
  isLatex,
  originalResume,
  onStartOver,
}: ResultsTabsProps) {
  const [tab, setTab] = useState<TabId>("resume");
  const [coverLetterDraft, setCoverLetterDraft] = useState(coverLetter);
  const [pdf, setPdf] = useState<PdfState>({ status: "compiling" });
  const [attempt, setAttempt] = useState(0);
  const pdfUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isLatex) return;
    let cancelled = false;

    compileLatexToPdf(tailoredResume)
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.pdfUrl) {
          pdfUrlRef.current = result.pdfUrl;
          setPdf({ status: "ready", url: result.pdfUrl });
        } else {
          setPdf({
            status: "error",
            message:
              result.message ||
              "This LaTeX didn't compile to a PDF. The source is still valid to copy or download.",
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setPdf({
          status: "error",
          message: err instanceof Error ? err.message : "Couldn't load the PDF preview engine.",
        });
      });

    return () => {
      cancelled = true;
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = undefined;
      }
    };
  }, [tailoredResume, isLatex, attempt]);

  function retryCompile() {
    setPdf({ status: "compiling" });
    setAttempt((n) => n + 1);
  }

  return (
    <section className="animate-reveal flex flex-col gap-6">
      <MatchAnalysis matchScore={matchScore} missingKeywords={missingKeywords} redFlags={redFlags} />

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
            className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-2 text-sm font-medium transition sm:px-4 ${
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
              <CopyButton text={tailoredResume} label={isLatex ? "Copy LaTeX" : "Copy"} />
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(isLatex ? "tailored-resume.tex" : "tailored-resume.txt", tailoredResume)
                }
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5"
              >
                <DownloadIcon />
                {isLatex ? "Download .tex" : "Download"}
              </button>
              {isLatex && (
                <button
                  type="button"
                  disabled={pdf.status !== "ready"}
                  onClick={() => pdf.status === "ready" && downloadUrl("tailored-resume.pdf", pdf.url)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <DownloadIcon />
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {isLatex ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <pre className="h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 font-mono text-sm leading-relaxed shadow-sm">
                {tailoredResume}
              </pre>
              <div className="h-[32rem] overflow-hidden rounded-md border border-line bg-surface shadow-sm">
                {pdf.status === "compiling" && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted">
                    <span className="step-pulse h-2 w-2 rounded-full bg-accent" />
                    Compiling the PDF preview. This can take a moment the first time.
                  </div>
                )}
                {pdf.status === "error" && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted">
                    <p>{pdf.message}</p>
                    <button
                      type="button"
                      onClick={retryCompile}
                      className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {pdf.status === "ready" && (
                  <iframe src={pdf.url} title="Tailored resume PDF preview" className="h-full w-full" />
                )}
              </div>
            </div>
          ) : (
            <pre className="h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 font-serif text-sm leading-relaxed shadow-sm">
              {tailoredResume}
            </pre>
          )}
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
            className="h-[32rem] w-full resize-y rounded-md border border-line bg-surface p-5 font-serif text-sm leading-relaxed shadow-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      )}

      {tab === "changes" && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">What changed</h2>
          <RedlineView before={originalResume} after={tailoredResume} />
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
