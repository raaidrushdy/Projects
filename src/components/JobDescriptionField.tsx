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
      <div className="flex items-center justify-between gap-2">
        <span id="job-field-label" className="text-sm font-medium">
          Job description <span className="text-muted">(required)</span>
        </span>
        <span className="text-xs tabular-nums text-muted">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the job posting you're applying to..."
        required
        aria-labelledby="job-field-label"
        className="h-80 w-full resize-none overflow-y-auto rounded-lg bg-surface p-3 text-base leading-relaxed shadow-sm outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
