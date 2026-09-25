"use client";

import { useMemo, useState } from "react";
import { diffWords } from "@/lib/diff";
import { extractReadableText } from "@/lib/latex";

interface RedlineViewProps {
  before: string;
  after: string;
}

type Mode = "readable" | "raw";

/** Shows the tailoring as an edit, not a swap: removed phrasing struck
    through in correction-red, added phrasing underlined in the accent —
    the same marks an editor would leave on a printed draft.

    Defaults to a diff of the extracted plain-text content, since the raw
    LaTeX diff strikes through/underlines markup (\begin{itemize}, \item,
    braces) right alongside the actual wording, which is noisy for anyone
    not fluent in reading LaTeX diffs. The raw view stays one click away
    for exact, character-for-character verification. */
export function RedlineView({ before, after }: RedlineViewProps) {
  const [mode, setMode] = useState<Mode>("readable");

  const readableOps = useMemo(
    () => diffWords(extractReadableText(before), extractReadableText(after)),
    [before, after],
  );
  const rawOps = useMemo(() => diffWords(before, after), [before, after]);
  const ops = mode === "readable" ? readableOps : rawOps;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Diff detail level"
        className="inline-flex w-fit gap-1 rounded-full border border-line bg-panel p-1 text-xs"
      >
        {(
          [
            { id: "readable", label: "Readable" },
            { id: "raw", label: "Raw LaTeX" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={mode === option.id}
            onClick={() => setMode(option.id)}
            className={`inline-flex min-h-9 items-center justify-center rounded-full px-3 font-medium outline-none transition-all duration-180 ease-precise focus-visible:ring-2 focus-visible:ring-accent/50 ${
              mode === option.id
                ? "bg-accent text-accent-foreground shadow-[0_0_16px_-4px_var(--color-accent)]"
                : "text-muted hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <pre
        tabIndex={0}
        className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 font-serif text-sm leading-relaxed shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {ops.map((op, i) => {
          if (op.type === "equal") return <span key={i}>{op.text}</span>;
          if (op.type === "remove") {
            return (
              <del
                key={i}
                className="text-redline-remove no-underline line-through decoration-1"
              >
                <span className="sr-only">Removed: </span>
                {op.text}
              </del>
            );
          }
          return (
            <ins key={i} className="text-accent font-semibold underline decoration-1 underline-offset-2">
              <span className="sr-only">Added: </span>
              {op.text}
            </ins>
          );
        })}
      </pre>
    </div>
  );
}
