function scoreTone(score: number) {
  if (score >= 75) {
    return "text-emerald-600 ring-emerald-600/30 dark:text-emerald-400 dark:ring-emerald-400/30";
  }
  if (score >= 50) {
    return "text-amber-600 ring-amber-600/30 dark:text-amber-400 dark:ring-amber-400/30";
  }
  return "text-red-600 ring-red-600/30 dark:text-red-400 dark:ring-red-400/30";
}

interface MatchAnalysisProps {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
}

export function MatchAnalysis({ matchScore, missingKeywords, redFlags }: MatchAnalysisProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ring-2 ${scoreTone(matchScore)}`}
        >
          {matchScore}
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Match score before tailoring</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            How well your original resume matched this posting, out of 100.
          </p>
        </div>
      </div>

      {missingKeywords.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Keywords the posting wants that you were missing</h3>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">What a hiring manager would flag in 10 seconds</h3>
          <ul className="flex flex-col gap-1.5">
            {redFlags.map((flag) => (
              <li
                key={flag}
                className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <span className="text-red-500 dark:text-red-400">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        All of this is already fixed in the tailored resume below.
      </p>
    </div>
  );
}
