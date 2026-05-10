import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type TaskRecord = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  caseId: string | null;
  clientId: string | null;
  archived: boolean;
  createdAt: string;
};

type TaskRow = {
  id: string;
  task_code: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string | null;
  due_date: string | null;
  assigned_to: string | null;
  case_id: string | null;
  client_id: string | null;
  archived: boolean | null;
  created_at: string;
};

const fromRow = (r: TaskRow): TaskRecord => ({
  id: r.id,
  code: r.task_code,
  title: r.title,
  description: r.description ?? "",
  status: r.status,
  priority: r.priority ?? "medium",
  dueDate: r.due_date,
  assignedTo: r.assigned_to,
  caseId: r.case_id,
  clientId: r.client_id,
  archived: r.archived ?? false,
  createdAt: r.created_at,
});

export function generateTaskCode(): string {
  return "TSK-" + Math.floor(10000 + Math.random() * 90000);
}

export type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: string;
  dueDate?: string | null;
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
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_code: generateTaskCode(),
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      due_date: input.dueDate || null,
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
