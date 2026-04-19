"use client";

import type { Task } from "@/types";
import Avatar from "@/components/ui/Avatar";
import { format } from "date-fns";

interface Props {
  task: Task;
  isDragging: boolean;
  onClick: () => void;
}

export default function KanbanCard({ task, isDragging, onClick }: Props) {
  const overdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 cursor-pointer border transition-all duration-150 ${
        isDragging
          ? "shadow-xl border-blue-300 rotate-1 scale-[1.02]"
          : "shadow-sm border-gray-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5"
      }`}
    >
      {/* Title */}
      <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-2">{task.title}</p>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              💬 {task._count!.comments}
            </span>
          )}
        </div>
        {task.assignee && <Avatar user={task.assignee} size="sm" />}
      </div>
    </div>
  );
}
