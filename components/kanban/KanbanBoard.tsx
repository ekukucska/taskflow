"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { Task, Project, User, Tag, Status } from "@/types";
import { STATUS_LABELS } from "@/lib/utils";
import KanbanCard from "./KanbanCard";
import TaskModal from "@/components/task-modal/TaskModal";
import ViewTabs from "@/components/ui/ViewTabs";

const COLUMNS: Status[] = ["BACKLOG", "TODO", "IN_PROGRESS", "HOLD", "DONE"];

const COLUMN_STYLES: Record<Status, { header: string; dot: string; bg: string }> = {
  BACKLOG: { header: "text-slate-600", dot: "bg-slate-400", bg: "bg-slate-50" },
  TODO: { header: "text-purple-600", dot: "bg-purple-500", bg: "bg-purple-50" },
  IN_PROGRESS: { header: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-50" },
  HOLD: { header: "text-yellow-600", dot: "bg-yellow-500", bg: "bg-yellow-50" },
  DONE: { header: "text-green-600", dot: "bg-green-500", bg: "bg-green-50" },
};

interface Props {
  project: Project;
  initialTasks: Task[];
  users: User[];
  tags: Tag[];
}

export default function KanbanBoard({ project, initialTasks, users, tags }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>("BACKLOG");

  const byStatus = (status: Status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as Status;
    const colTasks = byStatus(newStatus).filter((t) => t.id !== draggableId);
    const moved = tasks.find((t) => t.id === draggableId)!;

    // Insert at destination index
    colTasks.splice(destination.index, 0, { ...moved, status: newStatus });

    // Compute new positions
    const updatedPositions = colTasks.map((t, i) => ({ id: t.id, position: i + 1 }));

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        const up = updatedPositions.find((u) => u.id === t.id);
        if (up) return { ...t, status: newStatus, position: up.position };
        return t;
      })
    );

    // Persist moved task
    await fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, position: destination.index + 1 }),
    });
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
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="font-semibold text-gray-900">{project.name}</h1>
          </div>
          <ViewTabs projectId={project.id} />
        </div>
        <button
          onClick={() => { setNewTaskStatus("BACKLOG"); setShowNewTask(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full w-full">
            {COLUMNS.map((status) => {
              const colTasks = byStatus(status);
              const style = COLUMN_STYLES[status];
              return (
                <div key={status} className="flex flex-col flex-1 min-w-0">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-sm font-semibold ${style.header}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Droppable */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-xl p-2 space-y-2 transition-colors kanban-column ${
                          snapshot.isDraggingOver ? style.bg : "bg-gray-100/60"
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <KanbanCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => setSelectedTaskId(task.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add task button */}
                        <button
                          onClick={() => { setNewTaskStatus(status); setShowNewTask(true); }}
                          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors text-left px-3"
                        >
                          + Add task
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Task detail modal */}
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

      {/* New task modal */}
      {showNewTask && (
        <TaskModal
          taskId={null}
          projectId={project.id}
          users={users}
          tags={tags}
          onClose={() => setShowNewTask(false)}
          onSaved={handleTaskSaved}
          initialData={{ status: newTaskStatus }}
          isNew
        />
      )}
    </div>
  );
}
