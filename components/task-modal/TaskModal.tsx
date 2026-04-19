"use client";

import { useState, useEffect, useRef } from "react";
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
type SaveStatus = "idle" | "saving" | "saved" | "error";

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [newComment, setNewComment] = useState("");
  const [commentAuthorId, setCommentAuthorId] = useState(users[0]?.id ?? "");
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagPopoverRef = useRef<HTMLDivElement>(null);

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

  // Close tag popover on outside click
  useEffect(() => {
    if (!tagPopoverOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (tagPopoverRef.current && !tagPopoverRef.current.contains(e.target as Node)) {
        setTagPopoverOpen(false);
        setTagSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagPopoverOpen]);

  // Autosave a specific field override immediately (for dropdowns/date)
  async function autosaveField(overrides: Record<string, unknown>) {
    if (isNew || !taskId) return;
    setSaveStatus("saving");
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        tagIds: selectedTags,
        ...overrides,
      };
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        setTask((prev) => (prev ? { ...prev, ...saved } : saved));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }

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
      const res = await fetch(isNew ? "/api/tasks" : `/api/tasks/${taskId}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  function toggleTag(tagId: string, nextTags?: string[]) {
    const next = nextTags ?? (
      selectedTags.includes(tagId)
        ? selectedTags.filter((t) => t !== tagId)
        : [...selectedTags, tagId]
    );
    setSelectedTags(next);
    autosaveField({ tagIds: next });
  }

  const activeTags = tags.filter((t) => selectedTags.includes(t.id));
  const availableTags = tags.filter(
    (t) =>
      !selectedTags.includes(t.id) &&
      t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );
  const comments = task?.comments ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-800 text-base">
              {isNew ? "New Task" : "Task Details"}
            </h2>
            {!isNew && saveStatus !== "idle" && (
              <span
                className={`text-xs transition-opacity ${
                  saveStatus === "saving"
                    ? "text-gray-400"
                    : saveStatus === "saved"
                    ? "text-green-500"
                    : "text-red-400"
                }`}
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "saved"
                  ? "✓ Saved"
                  : "Error saving"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left — Title, Description, Comments */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <input
                  className={`w-full text-xl font-semibold text-gray-900 placeholder-gray-300 border-b-2 outline-none pb-1.5 bg-transparent transition-colors ${
                    !title.trim()
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-blue-400"
                  }`}
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                {!title.trim() && (
                  <p className="text-xs text-red-400 mt-1">Title is required.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description…"
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-colors"
                />
              </div>

              {/* Comments — existing tasks only */}
              {!isNew && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Comments{comments.length > 0 ? ` (${comments.length})` : ""}
                  </label>

                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic mb-4">
                      No comments yet. Start the conversation below.
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <img
                            src={
                              c.author.avatarUrl ??
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author.name)}&background=1976d2&color=fff`
                            }
                            alt={c.author.name}
                            className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700">
                                {c.author.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(new Date(c.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2">
                    <select
                      value={commentAuthorId}
                      onChange={(e) => setCommentAuthorId(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      placeholder="Add a comment…"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right — Metadata sidebar */}
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/40 flex-shrink-0">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatus(v);
                    autosaveField({ status: v });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPriority(v);
                    autosaveField({ priority: v });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAssigneeId(v);
                    autosaveField({ assigneeId: v || null });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date — autosaves on blur */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={(e) => autosaveField({ dueDate: e.target.value || null })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Tags — active pills + add popover */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Tags
                </label>

                {activeTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {activeTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button
                          onClick={() => toggleTag(tag.id)}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors leading-none"
                          title={`Remove ${tag.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {tags.length > activeTags.length && (
                  <div className="relative" ref={tagPopoverRef}>
                    <button
                      onClick={() => setTagPopoverOpen((v) => !v)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <span className="text-sm leading-none">+</span> Add tag
                    </button>

                    {tagPopoverOpen && (
                      <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 p-2">
                        <input
                          type="text"
                          placeholder="Search tags…"
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mb-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="space-y-0.5 max-h-36 overflow-y-auto">
                          {availableTags.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">No tags found</p>
                          ) : (
                            availableTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  toggleTag(tag.id);
                                  setTagSearch("");
                                  setTagPopoverOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-xs text-gray-700 text-left"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tags.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No tags available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors min-h-[44px]"
              >
                Delete task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              {isNew ? "Cancel" : "Close"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              {saving ? "Saving…" : isNew ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
