import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { AttachmentRecord } from "./clientStore";

export type TaskStatus = "todo" | "doing" | "review" | "done" | "cancelled";

export type TaskComment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type TaskRecord = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  assignedTo: string | null;     // primary assignee (single — backward compat)
  assignees: string[];           // all assignees (multi)
  caseId: string | null;
  clientId: string | null;
  archived: boolean;
  attachments: AttachmentRecord[];
  comments: TaskComment[];
  createdAt: string;
};

type TaskRow = {
  id: string;
  task_code: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string | null;
  start_date: string | null;
  due_date: string | null;
  assigned_to: string | null;
  assignees: string[] | null;
  case_id: string | null;
  client_id: string | null;
  archived: boolean | null;
  attachments: AttachmentRecord[] | null;
  comments: TaskComment[] | null;
  created_at: string;
};

const fromRow = (r: TaskRow): TaskRecord => ({
  id: r.id,
  code: r.task_code,
  title: r.title,
  description: r.description ?? "",
  status: r.status,
  priority: r.priority ?? "medium",
  startDate: r.start_date,
  dueDate: r.due_date,
  assignedTo: r.assigned_to,
  assignees: Array.isArray(r.assignees) ? r.assignees : [],
  caseId: r.case_id,
  clientId: r.client_id,
  archived: r.archived ?? false,
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
  comments: Array.isArray(r.comments) ? r.comments : [],
  createdAt: r.created_at,
});

/** Derived state: returns true if the task is past its due date and not done/cancelled. */
export function isTaskOverdue(t: TaskRecord, today = new Date()): boolean {
  if (!t.dueDate) return false;
  if (t.status === "done" || t.status === "cancelled") return false;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return t.dueDate < todayStr;
}

export function generateTaskCode(): string {
  return "TSK-" + Math.floor(10000 + Math.random() * 90000);
}

export type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: string;
  startDate?: string | null;
  dueDate?: string | null;
  assignees?: string[];
};

export async function listTasks(): Promise<TaskRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listTasks", error);
    return [];
  }
  return (data as TaskRow[]).map(fromRow);
}

export async function addTask(input: TaskInput): Promise<TaskRecord | null> {
  if (!supabase) return null;
  const assignees = input.assignees ?? [];
  // Note: we intentionally do NOT write to `assigned_to` (legacy column with a
  // FK to auth.users). Multi-assignee data lives in `assignees` jsonb.
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_code: generateTaskCode(),
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      start_date: input.startDate || null,
      due_date: input.dueDate || null,
      assignees,
    })
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as TaskRow);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) {
    console.error("updateTaskStatus", error);
    return false;
  }
  return true;
}

export async function updateTaskAssignees(
  id: string,
  assignees: string[]
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("tasks")
    .update({ assignees })
    .eq("id", id);
  if (error) {
    console.error("updateTaskAssignees", error);
    return false;
  }
  return true;
}

/**
 * Generic partial update. Pass camelCase fields and we'll convert to snake_case.
 */
export async function updateTask(
  id: string,
  patch: Partial<Omit<TaskRecord, "id" | "code" | "createdAt">>
): Promise<boolean> {
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
  if (patch.assignees !== undefined) row.assignees = patch.assignees;
  if (patch.attachments !== undefined) row.attachments = patch.attachments;
  if (patch.comments !== undefined) row.comments = patch.comments;
  if (patch.archived !== undefined) row.archived = patch.archived;
  const { error } = await supabase.from("tasks").update(row).eq("id", id);
  if (error) {
    console.error("updateTask", error);
    return false;
  }
  return true;
}

export async function addTaskComment(
  taskId: string,
  comment: Omit<TaskComment, "id" | "createdAt">
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("tasks")
    .select("comments")
    .eq("id", taskId)
    .maybeSingle();
  if (error || !data) return false;
  const current = Array.isArray(
    (data as { comments: TaskComment[] }).comments
  )
    ? (data as { comments: TaskComment[] }).comments
    : [];
  const next: TaskComment[] = [
    ...current,
    {
      ...comment,
      id: "c-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    },
  ];
  const { error: uerr } = await supabase
    .from("tasks")
    .update({ comments: next })
    .eq("id", taskId);
  return !uerr;
}

export async function removeTaskComment(
  taskId: string,
  commentId: string
): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from("tasks")
    .select("comments")
    .eq("id", taskId)
    .maybeSingle();
  if (!data) return false;
  const list = Array.isArray((data as { comments: TaskComment[] }).comments)
    ? (data as { comments: TaskComment[] }).comments
    : [];
  const next = list.filter((c) => c.id !== commentId);
  const { error } = await supabase
    .from("tasks")
    .update({ comments: next })
    .eq("id", taskId);
  return !error;
}

export async function addAttachmentsToTask(
  taskId: string,
  files: AttachmentRecord[]
): Promise<boolean> {
  if (!supabase || files.length === 0) return false;
  const { data, error } = await supabase
    .from("tasks")
    .select("attachments")
    .eq("id", taskId)
    .maybeSingle();
  if (error || !data) return false;
  const current = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = [...current, ...files];
  const { error: uerr } = await supabase
    .from("tasks")
    .update({ attachments: next })
    .eq("id", taskId);
  return !uerr;
}

export async function removeAttachmentFromTask(
  taskId: string,
  index: number
): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from("tasks")
    .select("attachments")
    .eq("id", taskId)
    .maybeSingle();
  if (!data) return false;
  const list = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = list.filter((_, i) => i !== index);
  const { error } = await supabase
    .from("tasks")
    .update({ attachments: next })
    .eq("id", taskId);
  return !error;
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  return !error;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listTasks();
    setTasks(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`tasks-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { tasks, loading, refresh };
}
