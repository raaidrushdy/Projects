/**
 * Best-effort LaTeX -> plain-text extraction, used only to give the redline
 * diff something readable to work on. This is not a LaTeX parser: it
 * pattern-matches the handful of constructs that show up in resume
 * templates (sections, itemize/item, common text-formatting commands,
 * escaped special characters) and unwraps or drops them. Anything it
 * doesn't recognize either keeps its argument text (commands with braces,
 * on the assumption the argument is displayable content) or gets dropped
 * (bare commands, on the assumption they're formatting/spacing). The raw
 * LaTeX diff stays available alongside this one for exact verification.
 */

// Commands whose argument is displayable text — unwrap to just the argument.
const KEEP_CONTENT_COMMANDS =
  "textbf|textit|emph|underline|textsc|texttt|textrm|textsf|uppercase|MakeUppercase|" +
  "Large|large|huge|Huge|small|footnotesize|scriptsize|normalsize";

// Commands with no useful argument (packages, spacing, layout) — drop
// entirely, argument included.
const DROP_WITH_ARG_COMMANDS =
  "usepackage|documentclass|pagestyle|geometry|vspace|hspace|setlength|addvspace|" +
  "newcommand|renewcommand|newenvironment|renewenvironment|label|ref|cite|" +
  "includegraphics|input|include|addcontentsline|definecolor|setmainfont|fontspec";

// Bare declarations (no braces) that only affect surrounding formatting.
const DROP_BARE_COMMANDS =
  "Large|large|huge|Huge|small|footnotesize|scriptsize|tiny|normalsize|bfseries|itshape|" +
  "scshape|mdseries|normalfont|upshape|rmfamily|sffamily|ttfamily|centering|raggedright|" +
  "raggedleft|quad|qquad|noindent|newline|hline|bigskip|medskip|smallskip|par|indent|" +
  "clearpage|newpage|linebreak|pagebreak";

function onePass(text: string): string {
  let out = text;

  out = out.replace(new RegExp(`\\\\(?:${KEEP_CONTENT_COMMANDS})\\s*\\{([^{}]*)\\}`, "g"), "$1");
  out = out.replace(/\\(?:sub)*section\*?\{([^{}]*)\}/g, "\n\n$1\n");
  out = out.replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, "$1");
  out = out.replace(/\\textcolor\{[^{}]*\}\{([^{}]*)\}/g, "$1");
  out = out.replace(
    new RegExp(`\\\\(?:${DROP_WITH_ARG_COMMANDS})\\*?(?:\\[[^\\]]*\\])?\\{[^{}]*\\}(?:\\{[^{}]*\\})?`, "g"),
    "",
  );
  out = out.replace(/\\(?:begin|end)\{[a-zA-Z*]+\}(?:\[[^\]]*\])?/g, "");
  out = out.replace(/\\item\b\s*/g, "\n• ");
  out = out.replace(new RegExp(`\\\\(?:${DROP_BARE_COMMANDS})\\b\\s*`, "g"), " ");
  // Fallback for anything else with a leaf (no nested braces) argument:
  // assume the argument is displayable content and keep it.
  out = out.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}/g, "$1");

  return out;
}

export function extractReadableText(tex: string): string {
  let body = tex.replace(/(^|[^\\])%.*$/gm, "$1");

  const documentMatch = body.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
  if (documentMatch) body = documentMatch[1];

  body = body.replace(/\\\\/g, "\n");

  for (let i = 0; i < 30; i++) {
    const next = onePass(body);
    if (next === body) break;
    body = next;
  }

  // Whatever's left with no argument at all (custom macros, \LaTeX, etc.)
  // carries no text of its own — drop the command name.
  body = body.replace(/\\[a-zA-Z]+\*?/g, "");

  body = body
    .replace(/~/g, " ")
    .replace(/\\([%&_$#])/g, "$1")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/[{}]/g, "");

  return body
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
