import {
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  LayoutGrid,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks, isTaskOverdue } from "../../lib/taskStore";
import { toLocalISO } from "../../lib/hijri";

type Stat = {
  title: string;
  value: number;
  icon: LucideIcon;
  bg: string;
  iconBg: string;
  iconColor: string;
  text: string;
};

export default function TasksKpis() {
  const { tasks } = useTasks();
  const today = toLocalISO(new Date());

  const active = tasks.filter((t) => !t.archived);
  const total = active.length;
  const dueToday = active.filter((t) => t.dueDate === today).length;
  const overdue = active.filter((t) => isTaskOverdue(t)).length;
  const done = active.filter((t) => t.status === "done").length;
  const cancelled = active.filter((t) => t.status === "cancelled").length;

  const items: Stat[] = [
    {
      title: "إجمالي المهام",
      value: total,
      icon: LayoutGrid,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
      text: "text-emerald-700",
    },
    {
      title: "مستحقة اليوم",
      value: dueToday,
      icon: CalendarClock,
      bg: "bg-violet-50",
      iconBg: "bg-violet-500",
      iconColor: "text-white",
      text: "text-violet-700",
    },
    {
      title: "متأخرة",
      value: overdue,
      icon: AlertCircle,
      bg: "bg-rose-50",
      iconBg: "bg-rose-500",
      iconColor: "text-white",
      text: "text-rose-700",
    },
    {
      title: "مكتملة",
      value: done,
      icon: CheckCircle2,
      bg: "bg-sky-50",
      iconBg: "bg-sky-500",
      iconColor: "text-white",
      text: "text-sky-700",
    },
    {
      title: "ملغاة",
      value: cancelled,
      icon: XCircle,
      bg: "bg-slate-100",
      iconBg: "bg-slate-500",
      iconColor: "text-white",
      text: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((s) => (
        <Card key={s.title} stat={s} />
      ))}
    </div>
  );
}

function Card({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div
      className={`rounded-2xl ${stat.bg} p-4 shadow-card flex items-center justify-between`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}
      >
        <Icon className={`w-5 h-5 ${stat.iconColor}`} />
      </div>
      <div className="text-right">
        <div className={`text-xs ${stat.text} font-bold opacity-90`}>{stat.title}</div>
        <div className={`text-3xl font-extrabold ${stat.text} mt-1`}>{stat.value}</div>
      </div>
    </div>
  );
}
