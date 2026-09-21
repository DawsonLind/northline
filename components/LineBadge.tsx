import { LINES } from "@/lib/seed";
import type { LineId } from "@/lib/types";

export function LineBadge({ line }: { line: LineId }) {
  const meta = LINES[line];
  return (
    <span
      className="inline-flex min-w-10 items-center justify-center rounded-sm px-2 py-0.5 font-mono text-xs font-bold text-[#0b0d10]"
      style={{ backgroundColor: meta.color }}
    >
      {meta.id}
    </span>
  );
}
