function scoreTone(score: number) {
  if (score >= 75) return "text-score-high ring-score-high/30";
  if (score >= 50) return "text-score-mid ring-score-mid/30";
  return "text-score-low ring-score-low/30";
}

interface MatchAnalysisProps {
  matchScore: number;
  missingKeywords: string[];
  redFlags: string[];
}

export function MatchAnalysis({ matchScore, missingKeywords, redFlags }: MatchAnalysisProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-black/10 pb-6 dark:border-white/10">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold ring-2 ${scoreTone(matchScore)}`}
        >
          {matchScore}
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Match score before tailoring</h2>
          <p className="text-sm text-muted">
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
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium dark:bg-white/10"
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

      <p className="text-xs text-muted">All of this is already fixed in the tailored resume below.</p>
    </div>
  );
}
