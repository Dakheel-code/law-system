import { Calendar, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasks } from "../../lib/taskStore";
import { useCases } from "../../lib/caseStore";
import { toLocalISO } from "../../lib/hijri";

type KPI = {
  title: string;
  value: string;
  sub: string;
  progress: number;
  icon: LucideIcon;
  bg: string;
};

const today = () => toLocalISO(new Date());

const startOfWeek = () => {
  const d = new Date();
  // Saturday start (Saudi week)
  const day = d.getDay();
  const diff = day === 6 ? 0 : day + 1; // Sat=6 in JS, want offset 0; Sun=0 → 1; Mon=1 → 2…
  d.setDate(d.getDate() - diff);
  return toLocalISO(d);
};
const endOfWeek = () => {
  const d = new Date(startOfWeek());
  d.setDate(d.getDate() + 6);
  return toLocalISO(d);
};

export default function AppointmentsKpis() {
  const { tasks } = useTasks();
  const { cases } = useCases();

  const t = today();
  const ws = startOfWeek();
  const we = endOfWeek();

  // Treat each task with a due_date and each case with start_date as an "appointment"
  const allAppointments = [
    ...tasks
      .filter((x) => x.dueDate && !x.archived)
      .map((x) => ({ date: x.dueDate as string, status: x.status })),
    ...cases
      .filter((c) => c.startDate)
      .map((c) => ({ date: c.startDate as string, status: c.status })),
  ];

  const todayCount = allAppointments.filter((a) => a.date === t).length;
  const weekTotal = allAppointments.filter((a) => a.date >= ws && a.date <= we).length;
  const overdue = allAppointments.filter(
    (a) => a.date < t && a.status !== "done" && a.status !== "ended"
  ).length;
  const completed = allAppointments.filter(
    (a) => a.status === "done" || a.status === "ended"
  ).length;
  const total = allAppointments.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  const items: KPI[] = [
    {
      title: "مواعيد اليوم",
      value: String(todayCount),
      sub: `${todayCount} قادمة`,
      progress: weekTotal > 0 ? Math.round((todayCount / weekTotal) * 100) : 0,
      icon: Calendar,
      bg: "from-sky-400 to-sky-500",
    },
    {
      title: "هذا الأسبوع",
      value: String(weekTotal),
      sub: `من أصل ${total} موعد`,
      progress: total > 0 ? Math.round((weekTotal / total) * 100) : 0,
      icon: CalendarDays,
      bg: "from-violet-500 to-violet-600",
    },
    {
      title: "متأخرة",
      value: String(overdue),
      sub: "بحاجة لمتابعة",
      progress: total > 0 ? Math.round((overdue / total) * 100) : 0,
      icon: AlertTriangle,
      bg: "from-rose-400 to-rose-500",
    },
    {
      title: "نسبة الالتزام",
      value: `${completionRate}%`,
      sub: `${completed} مكتمل من ${total}`,
      progress: completionRate,
      icon: CheckCircle2,
      bg: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.title}
            className={`relative overflow-hidden rounded-2xl text-white p-5 shadow-card bg-gradient-to-l ${it.bg}`}
          >
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <Icon className="w-6 h-6 opacity-80" />
                <div className="text-right">
                  <div className="text-sm/none opacity-90">{it.title}</div>
                  <div className="text-4xl font-extrabold mt-2">{it.value}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span>{it.progress}%</span>
                <span className="opacity-90">{it.sub}</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${it.progress}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
