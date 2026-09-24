interface MatchAnalysisProps {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
}

/** The full before/after analysis — score, missing keywords, red flags.
    Lives inside the Changes tab as supporting detail; the compact summary
    bar above the tabs is what most people see by default. */
export function MatchAnalysis({ matchScore, missingKeywords, redFlags }: MatchAnalysisProps) {
  return (
    <div id="missing-keywords" className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold tabular-nums text-accent ring-2 ring-accent/30">
          {matchScore}
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Match score before tailoring</h2>
          <p className="text-xs text-muted">
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
                className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium"
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
              <li key={flag} className="flex gap-2 text-sm text-muted">
                <span className="text-score-low">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted">Already addressed in the tailored resume.</p>
    </div>
  );
}
