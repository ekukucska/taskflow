"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import type { Task, Project, User, Tag } from "@/types";
import { PRIORITY_DOT_COLORS } from "@/lib/utils";
import TaskModal from "@/components/task-modal/TaskModal";
import ViewTabs from "@/components/ui/ViewTabs";

interface Props {
  project: Project;
  initialTasks: Task[];
  users: User[];
  tags: Tag[];
}

export default function CalendarView({ project, initialTasks, users, tags }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string>("");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksWithDue = tasks.filter((t) => t.dueDate);

  function getTasksForDay(day: Date) {
    return tasksWithDue.filter((t) => isSameDay(new Date(t.dueDate!), day));
  }

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              ‹
            </button>
            <span className="font-semibold text-gray-700 min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              ›
            </button>
          </div>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            Today
          </button>
          <button
            onClick={() => { setNewTaskDate(""); setShowNewTask(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Task
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`bg-white min-h-[100px] p-2 ${!isCurrentMonth ? "opacity-40" : ""}`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      today
                        ? "bg-blue-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {isCurrentMonth && (
                    <button
                      onClick={() => {
                        setNewTaskDate(format(day, "yyyy-MM-dd"));
                        setShowNewTask(true);
                      }}
                      className="text-gray-300 hover:text-gray-500 text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add task"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT_COLORS[task.priority]}`} />
                      <span className="text-xs text-gray-700 truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-400 px-1.5">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
          initialData={{ dueDate: newTaskDate || undefined }}
          isNew
        />
      )}
    </div>
  );
}
