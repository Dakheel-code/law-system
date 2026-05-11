import { useEffect, useState } from "react";
import { Gavel, ListTodo, Briefcase, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks } from "../../lib/taskStore";
import { useCases } from "../../lib/caseStore";
import type { AppointmentFilters } from "./filtersTypes";

type Chip = {
  id: string;            // unique per chip — used for highlighting
  filterType: string;    // "case" | "task" — what type filter to apply on click
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

  // Local active-chip tracking so chips with the same filterType don't all light up together.
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // If filter resets externally, clear local active chip.
  useEffect(() => {
    if (filters.type === "all") setActiveChip(null);
  }, [filters.type]);

  const courtSessions = cases.filter((c) => c.startDate).length;
  const tasksWithDue = tasks.filter((t) => t.dueDate && !t.archived).length;
  const allCases = cases.length;
  const allTasks = tasks.filter((t) => !t.archived).length;

  const chips: Chip[] = [
    {
      id: "sessions",
      filterType: "case",
      label: "جلسات قضايا",
      count: courtSessions,
      icon: Gavel,
      color: "text-emerald-500",
      activeBg: "bg-emerald-50 border-emerald-300",
    },
    {
      id: "tasks",
      filterType: "task",
      label: "مهام",
      count: tasksWithDue,
      icon: ListTodo,
      color: "text-violet-500",
      activeBg: "bg-violet-50 border-violet-300",
    },
    {
      id: "all-cases",
      filterType: "case",
      label: "إجمالي القضايا",
      count: allCases,
      icon: Briefcase,
      color: "text-sky-500",
      activeBg: "bg-sky-50 border-sky-300",
    },
    {
      id: "all-tasks",
      filterType: "task",
      label: "إجمالي المهام",
      count: allTasks,
      icon: Calendar,
      color: "text-rose-500",
      activeBg: "bg-rose-50 border-rose-300",
    },
  ];

  const handleClick = (chip: Chip) => {
    if (activeChip === chip.id) {
      setActiveChip(null);
      onChange({ type: "all" });
    } else {
      setActiveChip(chip.id);
      onChange({ type: chip.filterType });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {chips.map((c) => {
        const Icon = c.icon;
        const active = activeChip === c.id;
        return (
          <button
            key={c.id}
            onClick={() => handleClick(c)}
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
