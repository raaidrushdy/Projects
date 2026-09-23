"use client";

import { CopyButton } from "@/components/CopyButton";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
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
}

export function ResultCard({ title, text, filename, monospace, note }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {note && <p className="text-xs text-muted">{note}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyButton text={text} label="Copy" />
          <button
            type="button"
            onClick={() => downloadTextFile(filename, text)}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>
      {/* Deliberately paper-like rather than another UI card: this is the
          document the user is about to submit somewhere, not app chrome. */}
      <pre
        className={`max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-black/10 bg-surface p-5 text-sm leading-relaxed shadow-sm dark:border-white/10 ${monospace ? "font-mono" : "font-serif"}`}
      >
        {text}
      </pre>
    </div>
  );
}
