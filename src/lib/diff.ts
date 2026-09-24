export type DiffOp = { type: "equal" | "remove" | "add"; text: string };

/**
 * Word-level diff via LCS, splitting on whitespace so spacing round-trips
 * exactly. Adjacent same-type tokens are merged into one segment so
 * RedlineView renders a handful of <del>/<ins> runs, not one per word.
 */
export function diffWords(before: string, after: string): DiffOp[] {
  // Each token is a word plus its trailing whitespace, e.g. "Built ". Keeping
  // the two together means a plain " " token never floats free to LCS-match
  // some unrelated space elsewhere in the text — the bug that silently
  // swallowed spacing between adjacent del/ins runs when whitespace was its
  // own token type.
  const tokenize = (text: string) => text.match(/\S+\s*|\s+/g) ?? [];
  const a = tokenize(before);
  const b = tokenize(after);

  // Match on the word with its trailing whitespace trimmed off, so a word
  // that only gained or lost trailing space (e.g. it used to end the
  // sentence and now has a clause appended after it) still matches as
  // unchanged instead of registering as a spurious remove+add.
  const keyOf = (token: string) => (/\S/.test(token) ? token.trimEnd() : token);
  const ak = a.map(keyOf);
  const bk = b.map(keyOf);

  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        ak[i] === bk[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  function push(type: DiffOp["type"], text: string) {
    const last = ops[ops.length - 1];
    if (last && last.type === type) {
      last.text += text;
    } else {
      ops.push({ type, text });
    }
  }

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (ak[i] === bk[j]) {
      // Use the "after" token so the reconstructed non-removed text matches
      // the tailored resume exactly, including its own whitespace.
      push("equal", b[j]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push("remove", a[i]);
      i++;
    } else {
      push("add", b[j]);
      j++;
    }
  }
  while (i < a.length) push("remove", a[i++]);
  while (j < b.length) push("add", b[j++]);

  return ops;
}
