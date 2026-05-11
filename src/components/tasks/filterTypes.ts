import type { TaskRecord } from "../../lib/taskStore";

export type TasksFiltersState = {
  search: string;
  dateFrom: string;       // YYYY-MM-DD
  dateTo: string;         // YYYY-MM-DD
  calendar: "greg" | "hijri";
  sort: "none" | "date-asc" | "date-desc";
  assignee: string;       // "all" | user id
  status: string;         // "all" | "todo" | "doing" | "review" | "done"
  priority: string;       // "all" | "low" | "medium" | "high" | "urgent"
};

export const defaultTasksFilters: TasksFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  calendar: "greg",
  sort: "none",
  assignee: "all",
  status: "all",
  priority: "all",
};

export function filterTasks(
  tasks: TaskRecord[],
  f: TasksFiltersState
): TaskRecord[] {
  let list = tasks.filter((t) => !t.archived);

  const q = f.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
    );
  }

  if (f.dateFrom) list = list.filter((t) => (t.dueDate ?? "") >= f.dateFrom);
  if (f.dateTo) list = list.filter((t) => (t.dueDate ?? "") <= f.dateTo);

  if (f.assignee !== "all") list = list.filter((t) => t.assignedTo === f.assignee);
  if (f.status !== "all") list = list.filter((t) => t.status === f.status);
  if (f.priority !== "all") list = list.filter((t) => t.priority === f.priority);

  if (f.sort === "date-asc") {
    list = [...list].sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  } else if (f.sort === "date-desc") {
    list = [...list].sort((a, b) => (b.dueDate ?? "").localeCompare(a.dueDate ?? ""));
  }

  return list;
}

export function hasActiveTasksFilters(f: TasksFiltersState): boolean {
  return (
    f.search !== "" ||
    f.dateFrom !== "" ||
    f.dateTo !== "" ||
    f.sort !== "none" ||
    f.assignee !== "all" ||
    f.status !== "all" ||
    f.priority !== "all"
  );
}
