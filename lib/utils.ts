export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "bg-slate-100 text-slate-600",
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  HOLD: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
};

export const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  HOLD: "On Hold",
  DONE: "Done",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
