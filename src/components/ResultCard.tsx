"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { RedlineView } from "@/components/RedlineView";

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

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface ResultCardProps {
  title: string;
  text: string;
  filename: string;
  /** LaTeX source reads as code, not prose — monospace instead of the document serif. */
  monospace?: boolean;
  note?: string;
  /** The pre-tailoring text this was drafted from. When set (and not
      monospace/LaTeX), a toggle lets the reader see the tailoring as an
      edit — the redline — instead of just the finished text. */
  originalText?: string;
  /** The tailored resume is the product's actual deliverable; the cover
      letter is a secondary bonus. Without a size/weight distinction the two
      cards read as equally important, which they aren't. */
  primary?: boolean;
}

export function ResultCard({ title, text, filename, monospace, note, originalText, primary }: ResultCardProps) {
  const [showChanges, setShowChanges] = useState(false);
  const canShowChanges = Boolean(originalText) && !monospace;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className={`tracking-tight ${primary ? "text-lg font-semibold" : "text-base font-medium"}`}
          >
            {title}
          </h2>
          {note && <p className="text-xs text-muted">{note}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {canShowChanges && (
            <button
              type="button"
              onClick={() => setShowChanges((value) => !value)}
              aria-pressed={showChanges}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                showChanges
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-line text-muted hover:bg-foreground/5"
              }`}
            >
              {showChanges ? "Hide changes" : "Show changes"}
            </button>
          )}
          <CopyButton text={text} label="Copy" />
          <button
            type="button"
            onClick={() => downloadTextFile(filename, text)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-foreground/5"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>

      {/* Deliberately paper-like rather than another UI card: this is the
          document the user is about to submit somewhere, not app chrome. */}
      {canShowChanges && showChanges ? (
        <RedlineView before={originalText as string} after={text} />
      ) : (
        <pre
          className={`max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 text-sm leading-relaxed shadow-sm ${monospace ? "font-mono" : "font-serif"}`}
        >
          {text}
        </pre>
      )}
    </div>
  );
}
