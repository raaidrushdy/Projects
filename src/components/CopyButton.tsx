"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable; silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-black/5 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/10"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
