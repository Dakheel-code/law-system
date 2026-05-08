import { Calendar, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type KPI = {
  title: string;
  value: string;
  sub: string;
  progress: number;
  icon: LucideIcon;
  bg: string;
};

const items: KPI[] = [
  {
    title: "مواعيد اليوم",
    value: "0",
    sub: "0 قادمة",
    progress: 0,
    icon: Calendar,
    bg: "from-sky-400 to-sky-500",
  },
  {
    title: "هذا الأسبوع",
    value: "0",
    sub: "من أصل 0 موعد",
    progress: 0,
    icon: CalendarDays,
    bg: "from-violet-500 to-violet-600",
  },
  {
    title: "متأخرة",
    value: "0",
    sub: "بحاجة لمتابعة",
    progress: 0,
    icon: AlertTriangle,
    bg: "from-rose-400 to-rose-500",
  },
  {
    title: "نسبة الالتزام",
    value: "100%",
    sub: "0 مكتمل من 0",
    progress: 100,
    icon: CheckCircle2,
    bg: "from-emerald-500 to-emerald-600",
  },
];

export default function AppointmentsKpis() {
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
