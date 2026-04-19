"use client";

import { useState, useEffect } from "react";
import type { Task, User, Tag, Comment } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils";
import { format } from "date-fns";

interface TaskModalProps {
  taskId: string | null;
  projectId: string;
  users: User[];
  tags: Tag[];
  onClose: () => void;
  onSaved: (task: Task) => void;
  onDeleted?: (taskId: string) => void;
  initialData?: Partial<Task>;
  isNew?: boolean;
}

const STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "HOLD", "DONE"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function TaskModal({
  taskId,
  projectId,
  users,
  tags,
  onClose,
  onSaved,
  onDeleted,
  initialData,
  isNew = false,
}: TaskModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAuthorId, setCommentAuthorId] = useState(users[0]?.id ?? "");

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<string>(initialData?.status ?? "BACKLOG");
  const [priority, setPriority] = useState<string>(initialData?.priority ?? "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? initialData.dueDate.split("T")[0] : ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map((t) => t.tagId) ?? []
  );

  useEffect(() => {
    if (!isNew && taskId) {
      fetch(`/api/tasks/${taskId}`)
        .then((r) => r.json())
        .then((data: Task) => {
          setTask(data);
          setTitle(data.title);
          setDescription(data.description ?? "");
          setStatus(data.status);
          setPriority(data.priority);
          setAssigneeId(data.assigneeId ?? "");
          setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
          setSelectedTags(data.tags?.map((t) => t.tagId) ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [taskId, isNew]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        tagIds: selectedTags,
        projectId,
      };

      let res: Response;
      if (isNew) {
        res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        onSaved(saved);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!taskId || !confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    onDeleted?.(taskId);
    onClose();
  }

  async function handleAddComment() {
    if (!newComment.trim() || !taskId || !commentAuthorId) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment.trim(), taskId, authorId: commentAuthorId }),
    });
    if (res.ok) {
      const comment: Comment = await res.json();
      setTask((prev) =>
        prev ? { ...prev, comments: [...(prev.comments ?? []), comment] } : prev
      );
      setNewComment("");
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-lg">
            {isNew ? "New Task" : "Task Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                className={`w-full text-lg font-semibold text-gray-900 placeholder-gray-300 border-b-2 outline-none focus:ring-0 pb-1 bg-transparent transition-colors ${
                  title.trim() ? "border-gray-200 focus:border-indigo-400" : "border-red-300 focus:border-red-400"
                }`}
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {!title.trim() && (
                <p className="text-xs text-red-400 mt-1">Title is required to create a task.</p>
              )}
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "text-white border-transparent"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Comments — only for existing tasks */}
            {!isNew && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Comments ({task?.comments?.length ?? 0})
                </label>
                <div className="space-y-3 mb-3">
                  {task?.comments?.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <img
                        src={c.author.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author.name)}&background=6366f1&color=fff`}
                        alt={c.author.name}
                        className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700">{c.author.name}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(c.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={commentAuthorId}
                    onChange={(e) => setCommentAuthorId(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                Delete task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : isNew ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
