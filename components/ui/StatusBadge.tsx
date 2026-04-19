import type { Status } from "@/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
