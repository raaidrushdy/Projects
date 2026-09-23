"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".tex", ".txt"];

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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Couldn't read that file.");
      }

      onChange(data.text as string);
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

  function clearFile() {
    setFileName(null);
    setUploadError(null);
    onChange("");
  }

  const showOverlay = !value && !isUploading;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Your resume</span>
        {fileName && (
          <button
            type="button"
            onClick={clearFile}
            className="text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {fileName} · clear
          </button>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition ${
          isDragging
            ? "border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-neutral-900"
            : "border-black/10 dark:border-white/15"
        }`}
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={showOverlay ? "" : ""}
          rows={12}
          className="w-full resize-y rounded-xl bg-transparent p-3 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
        />

        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-neutral-500 dark:text-neutral-400">
            <UploadIcon />
            <p className="text-sm">
              Drop your resume here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="pointer-events-auto font-medium text-neutral-800 underline underline-offset-2 dark:text-neutral-200"
              >
                browse files
              </button>
            </p>
            <p className="text-xs">PDF, Word (.docx), or LaTeX (.tex) — or paste text directly</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-white/80 text-sm text-neutral-600 dark:bg-neutral-950/80 dark:text-neutral-300">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
            Reading your file...
          </div>
        )}
      </div>

      {uploadError && <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>}

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
