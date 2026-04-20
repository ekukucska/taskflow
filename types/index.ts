export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "HOLD" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  position: number;
  projectId: string;
  assigneeId: string | null;
  assignee: User | null;
  dueDate: string | null;
  createdAt: string;
  version: number;
  tags: TaskTag[];
  comments?: Comment[];
  _count?: { comments: number };
  project?: Project;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  ownerId: string;
  owner?: User;
  createdAt: string;
  tasks?: Task[];
  _count?: { tasks: number };
}
