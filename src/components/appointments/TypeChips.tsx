import { Gavel, MessageSquare, ListTodo, Briefcase, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks } from "../../lib/taskStore";
import { useCases } from "../../lib/caseStore";
import type { AppointmentFilters } from "./filtersTypes";

type Chip = {
  key: string;       // matches filters.type values
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
  activeBg: string;
};

type Props = {
  filters: AppointmentFilters;
  onChange: (patch: Partial<AppointmentFilters>) => void;
};

export default function TypeChips({ filters, onChange }: Props) {
  const { tasks } = useTasks();
  const { cases } = useCases();

  const courtSessions = cases.filter((c) => c.startDate).length;
  const consultations = cases.filter((c) => c.caseType === "consultation").length;
  const tasksWithDue = tasks.filter((t) => t.dueDate && !t.archived).length;
  const allCases = cases.length;
  const allTasks = tasks.filter((t) => !t.archived).length;

  // chip key maps to filter.type: "case" for case-derived, "task" for tasks, "all" for totals
  const chips: Chip[] = [
    { key: "case",  label: "جلسات قضايا", count: courtSessions, icon: Gavel, color: "text-emerald-500", activeBg: "bg-emerald-50 border-emerald-300" },
    { key: "case",  label: "استشارات",   count: consultations, icon: MessageSquare, color: "text-amber-500", activeBg: "bg-amber-50 border-amber-300" },
    { key: "task",  label: "مهام",       count: tasksWithDue, icon: ListTodo, color: "text-violet-500", activeBg: "bg-violet-50 border-violet-300" },
    { key: "case",  label: "إجمالي القضايا", count: allCases, icon: Briefcase, color: "text-sky-500", activeBg: "bg-sky-50 border-sky-300" },
    { key: "task",  label: "إجمالي المهام", count: allTasks, icon: Calendar, color: "text-rose-500", activeBg: "bg-rose-50 border-rose-300" },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {chips.map((c, i) => {
        const Icon = c.icon;
        const active = filters.type === c.key;
        return (
          <button
            key={`${c.label}-${i}`}
            onClick={() => onChange({ type: active ? "all" : c.key })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm border transition ${
              active
                ? `${c.activeBg} font-bold`
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="text-xs text-slate-500 font-bold">{c.count}</span>
            <span className="text-slate-700">{c.label}</span>
            <Icon className={`w-4 h-4 ${c.color}`} />
          </button>
        );
      })}
    </div>
  );
}
