"use client";

import { useState, useMemo } from "react";
import type { Task, Project, User, Tag, Status, Priority } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import TaskModal from "@/components/task-modal/TaskModal";
import ViewTabs from "@/components/ui/ViewTabs";
import { format } from "date-fns";

type SortField = "title" | "status" | "priority" | "dueDate" | "assignee" | "createdAt";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
const STATUS_ORDER: Record<Status, number> = { BACKLOG: 0, TODO: 1, IN_PROGRESS: 2, HOLD: 3, DONE: 4 };

interface Props {
  project: Project;
  initialTasks: Task[];
  users: User[];
  tags: Tag[];
}

export default function ListView({ project, initialTasks, users, tags }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    let filtered = tasks.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && t.assigneeId !== filterAssignee) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "dueDate":
          cmp = (new Date(a.dueDate ?? 0).getTime()) - (new Date(b.dueDate ?? 0).getTime());
          break;
        case "assignee":
          cmp = (a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? "");
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [tasks, sortField, sortDir, filterStatus, filterPriority, filterAssignee]);

  function handleTaskSaved(saved: Task) {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-indigo-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="font-semibold text-gray-900">{project.name}</h1>
          </div>
          <ViewTabs projectId={project.id} />
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-400">{sorted.length} tasks</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                className="text-left px-6 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 w-2/5"
                onClick={() => handleSort("title")}
              >
                Title <SortIcon field="title" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("status")}
              >
                Status <SortIcon field="status" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("priority")}
              >
                Priority <SortIcon field="priority" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("assignee")}
              >
                Assignee <SortIcon field="assignee" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("dueDate")}
              >
                Due Date <SortIcon field="dueDate" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.map((task) => {
              const overdue =
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
              return (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-800 truncate max-w-xs">{task.title}</div>
                    {task.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
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
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar user={task.assignee} size="sm" />
                        <span className="text-gray-700 text-xs">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-500"}`}>
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No tasks match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          projectId={project.id}
          users={users}
          tags={tags}
          onClose={() => setSelectedTaskId(null)}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showNewTask && (
        <TaskModal
          taskId={null}
          projectId={project.id}
          users={users}
          tags={tags}
          onClose={() => setShowNewTask(false)}
          onSaved={handleTaskSaved}
          isNew
        />
      )}
    </div>
  );
}
