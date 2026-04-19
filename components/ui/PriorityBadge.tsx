import type { Priority } from "@/types";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
