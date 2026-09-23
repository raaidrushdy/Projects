/** A real .tex resume always has one of these near the top; plain text never does. */
export function looksLikeLatex(text: string): boolean {
  return /\\documentclass|\\begin\{document\}/.test(text);
}
