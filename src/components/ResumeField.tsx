"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type UIEvent } from "react";
import { parseJsonResponse } from "@/lib/api";
import { MAX_INPUT_CHARS } from "@/lib/limits";

const ACCEPTED_EXTENSIONS = [".tex"];
const MIN_GUTTER_LINES = 12;
// Below this length a partial paste/first few keystrokes shouldn't trigger
// the "doesn't look like LaTeX" warning.
const LATEX_CHECK_MIN_CHARS = 40;

function looksLikeLatex(text: string): boolean {
  return /\\(documentclass|begin\{document\})/.test(text);
}

interface ResumeFieldProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
}

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function UploadIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
      />
    </svg>
  );
}

export function ResumeField({ value, onChange, onLoadExample }: ResumeFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(
    () => Math.max(value.split("\n").length, MIN_GUTTER_LINES),
    [value],
  );

  const charCount = value.length;
  const isOverLimit = charCount > MAX_INPUT_CHARS;
  const showLatexWarning =
    charCount >= LATEX_CHECK_MIN_CHARS && !looksLikeLatex(value);

  async function uploadFile(file: File) {
    if (!isAcceptedFile(file)) {
      setUploadError("Unsupported file type. Upload a .tex file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/extract-resume", { method: "POST", body: formData });
      const data = (await parseJsonResponse(response)) as { text?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Couldn't read that file.");
      }

      onChange(data.text ?? "");
      setFileName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  function handleTextareaScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  }

  function clearFile() {
    setFileName(null);
    setUploadError(null);
    onChange("");
  }

  function handleLoadExample() {
    setFileName(null);
    setUploadError(null);
    onLoadExample();
  }

  // The overlay is a drop-zone invitation for the idle, untouched field —
  // once it's focused (even with nothing typed yet), it should get out of
  // the way and show line 1 with a blinking cursor, like a real code editor,
  // not stay covering the gutter until the first keystroke.
  const showOverlay = !value && !isUploading && !isFocused;

  return (
    <div className="flex flex-col gap-2">
      <span id="resume-field-label" className="text-sm font-medium">
        Your resume <span className="text-muted">(required)</span>
      </span>

      {/* Styled like a code editor (monospace, line-number gutter) since the
          resume is always LaTeX source. The toolbar (Load example/Upload)
          lives inside this fixed-height box, not in the label row above, so
          the label row stays a plain text baseline shared with the job
          description panel — both panels' top and bottom edges land in the
          same place regardless of what's inside. */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex h-80 flex-col overflow-hidden rounded-lg bg-surface shadow-sm transition focus-within:ring-2 focus-within:ring-accent/40 ${
          isDragging ? "ring-2 ring-accent bg-accent/5" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 font-sans text-xs">
          {fileName ? (
            <button
              type="button"
              onClick={clearFile}
              className="inline-flex min-h-11 items-center rounded-sm text-muted underline decoration-current/30 underline-offset-2 outline-none transition-colors duration-180 ease-precise hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {fileName} · clear
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoadExample}
              className="inline-flex min-h-11 items-center rounded-sm text-muted underline decoration-current/30 underline-offset-2 outline-none transition-colors duration-180 ease-precise hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Load example
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className={`font-mono tabular-nums ${isOverLimit ? "text-score-low" : "text-muted"}`}>
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-muted outline-none transition-colors duration-180 ease-precise hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              Upload
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 overflow-hidden font-mono text-base">
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="select-none overflow-hidden py-3 pl-3 pr-2 text-right leading-relaxed text-muted/50"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onScroll={handleTextareaScroll}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required
            aria-labelledby="resume-field-label"
            className="w-full resize-none overflow-y-auto bg-transparent py-3 pr-3 leading-relaxed outline-none"
          />

          {showOverlay && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface px-6 text-center font-sans text-muted">
              <UploadIcon />
              <p className="text-sm">Paste your .tex resume, or drop a .tex file here</p>
              <p className="text-xs">LaTeX (.tex) only.</p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface/90 font-sans text-sm text-muted">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/50 border-t-transparent" />
              Reading your file...
            </div>
          )}
        </div>
      </div>

      {uploadError && <p className="text-xs text-score-low">{uploadError}</p>}

      {!uploadError && isOverLimit && (
        <p className="text-xs text-score-low">
          {charCount.toLocaleString()} characters is over the {MAX_INPUT_CHARS.toLocaleString()}{" "}
          limit. Trim it down before submitting.
        </p>
      )}

      {!uploadError && !isOverLimit && showLatexWarning && (
        <p className="text-xs text-muted">
          This doesn&apos;t look like LaTeX source (no <code>\documentclass</code> or{" "}
          <code>\begin&#123;document&#125;</code>). Redrafted edits .tex files in place, so
          results may be unreliable.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
