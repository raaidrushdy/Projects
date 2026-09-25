"use client";

import { useMemo } from "react";

interface JobDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionField({ value, onChange }: JobDescriptionFieldProps) {
  const wordCount = useMemo(() => {
    const trimmed = value.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <span id="job-field-label" className="text-sm font-medium">
        Job description <span className="text-muted">(required)</span>
      </span>

      {/* Same box structure as the resume panel (toolbar strip + content
          area inside one fixed-height box) so both panels' top and bottom
          edges match exactly. */}
      <div className="flex h-80 flex-col overflow-hidden rounded-lg bg-surface shadow-sm transition focus-within:ring-2 focus-within:ring-accent/40">
        <div className="flex min-h-11 items-center justify-end border-b border-line px-3 font-sans text-xs text-muted">
          <span className="font-mono tabular-nums">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste the job posting you're applying to..."
          required
          aria-labelledby="job-field-label"
          className="w-full flex-1 resize-none overflow-y-auto bg-transparent p-3 text-base leading-relaxed outline-none"
        />
      </div>
    </div>
  );
}
