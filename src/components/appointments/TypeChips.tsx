import { Gavel, MessageSquare, ListTodo, Briefcase, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks } from "../../lib/taskStore";
import { useCases } from "../../lib/caseStore";

type Chip = { label: string; count: number; icon: LucideIcon; color: string };

export default function TypeChips() {
  const { tasks } = useTasks();
  const { cases } = useCases();

  const courtSessions = cases.filter((c) => c.startDate).length;
  const consultations = cases.filter((c) => c.caseType === "consultation").length;
  const tasksWithDue = tasks.filter((t) => t.dueDate && !t.archived).length;
  const allCases = cases.length;
  const allTasks = tasks.filter((t) => !t.archived).length;

  const chips: Chip[] = [
    { label: "جلسات قضايا", count: courtSessions, icon: Gavel, color: "text-emerald-500" },
    { label: "استشارات", count: consultations, icon: MessageSquare, color: "text-amber-500" },
    { label: "مهام", count: tasksWithDue, icon: ListTodo, color: "text-violet-500" },
    { label: "إجمالي القضايا", count: allCases, icon: Briefcase, color: "text-sky-500" },
    { label: "إجمالي المهام", count: allTasks, icon: Calendar, color: "text-rose-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {chips.map((c) => {
        const Icon = c.icon;
        return (
          <span
            key={c.label}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm shadow-sm"
          >
            <span className="text-xs text-slate-500 font-bold">{c.count}</span>
            <span className="text-slate-700">{c.label}</span>
            <Icon className={`w-4 h-4 ${c.color}`} />
          </span>
        );
      })}
    </div>
  );
}
