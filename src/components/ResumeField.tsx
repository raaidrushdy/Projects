"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type UIEvent } from "react";
import { parseJsonResponse } from "@/lib/api";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".tex", ".txt"];
const MIN_GUTTER_LINES = 12;

interface ResumeFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-6 w-6"
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

export function ResumeField({ value, onChange }: ResumeFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(
    () => Math.max(value.split("\n").length, MIN_GUTTER_LINES),
    [value],
  );

  async function uploadFile(file: File) {
    if (!isAcceptedFile(file)) {
      setUploadError("Unsupported file type. Upload a PDF, .docx, or .tex file.");
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

  const showOverlay = !value && !isUploading;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span id="resume-field-label" className="text-sm font-medium">
          Your resume
        </span>
        {fileName && (
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex min-h-11 items-center text-xs text-muted underline decoration-current/30 underline-offset-2 transition hover:text-foreground"
          >
            {fileName} · clear
          </button>
        )}
      </div>

      {/* Styled like a code editor (monospace, line-number gutter) since
          pasted resumes are often LaTeX source; file upload still works the
          same as any other panel. */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex overflow-hidden rounded-lg bg-surface font-mono text-base shadow-sm transition focus-within:ring-2 focus-within:ring-accent/40 ${
          isDragging ? "ring-2 ring-accent bg-accent/5" : ""
        }`}
      >
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
          rows={12}
          aria-labelledby="resume-field-label"
          className="w-full resize-y bg-transparent py-3 pr-3 leading-relaxed outline-none"
        />

        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface px-6 text-center font-sans text-muted">
            <UploadIcon />
            <p className="text-sm">
              Drop your resume here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="pointer-events-auto inline-flex min-h-11 items-center px-1 font-medium text-foreground underline underline-offset-2"
              >
                browse files
              </button>
            </p>
            <p className="text-xs">PDF, Word (.docx), or LaTeX (.tex) — or paste text directly</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface/90 font-sans text-sm text-muted">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/50 border-t-transparent" />
            Reading your file...
          </div>
        )}
      </div>

      {uploadError && <p className="text-xs text-score-low">{uploadError}</p>}

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
