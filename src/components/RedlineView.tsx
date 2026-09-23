import { diffWords } from "@/lib/diff";

interface RedlineViewProps {
  before: string;
  after: string;
}

/** Shows the tailoring as an edit, not a swap: removed phrasing struck
    through in correction-red, added phrasing underlined in the accent —
    the same marks an editor would leave on a printed draft. */
export function RedlineView({ before, after }: RedlineViewProps) {
  const ops = diffWords(before, after);

  return (
    <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-5 font-serif text-sm leading-relaxed shadow-sm">
      {ops.map((op, i) => {
        if (op.type === "equal") return <span key={i}>{op.text}</span>;
        if (op.type === "remove") {
          return (
            <del
              key={i}
              className="text-redline-remove no-underline line-through decoration-1 opacity-75"
            >
              {op.text}
            </del>
          );
        }
        return (
          <ins key={i} className="text-accent font-semibold underline decoration-1 underline-offset-2">
            {op.text}
          </ins>
        );
      })}
    </pre>
  );
}
