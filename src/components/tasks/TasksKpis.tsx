import {
  CheckCircle2,
  AlertCircle,
  Loader,
  CircleDashed,
  CalendarClock,
  LayoutGrid,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  title: string;
  value: number;
  icon: LucideIcon;
  bg: string;
  iconBg: string;
  iconColor: string;
  text: string;
};

const top: Stat[] = [
  {
    title: "إجمالي المهام",
    value: 0,
    icon: LayoutGrid,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    text: "text-emerald-700",
  },
  {
    title: "مستحقة اليوم",
    value: 0,
    icon: CalendarClock,
    bg: "bg-violet-50",
    iconBg: "bg-violet-500",
    iconColor: "text-white",
    text: "text-violet-700",
  },
  {
    title: "المتبقية",
    value: 0,
    icon: CircleDashed,
    bg: "bg-slate-50",
    iconBg: "bg-slate-400",
    iconColor: "text-white",
    text: "text-slate-700",
  },
  {
    title: "قيد التنفيذ",
    value: 0,
    icon: Loader,
    bg: "bg-amber-50",
    iconBg: "bg-amber-400",
    iconColor: "text-white",
    text: "text-amber-700",
  },
  {
    title: "متأخرة",
    value: 0,
    icon: AlertCircle,
    bg: "bg-rose-50",
    iconBg: "bg-rose-500",
    iconColor: "text-white",
    text: "text-rose-700",
  },
  {
    title: "مكتملة",
    value: 0,
    icon: CheckCircle2,
    bg: "bg-sky-50",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    text: "text-sky-700",
  },
];

const archive: Stat = {
  title: "مؤرشفة",
  value: 0,
  icon: Archive,
  bg: "bg-slate-100",
  iconBg: "bg-slate-700",
  iconColor: "text-white",
  text: "text-slate-700",
};

export default function TasksKpis() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {top.map((s) => (
        <Card key={s.title} stat={s} />
      ))}
      <Card stat={archive} />
    </div>
  );
}

function Card({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div className={`rounded-2xl ${stat.bg} p-4 shadow-card flex items-center justify-between`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
        <Icon className={`w-5 h-5 ${stat.iconColor}`} />
      </div>
      <div className="text-right">
        <div className={`text-xs ${stat.text} font-bold opacity-90`}>{stat.title}</div>
        <div className={`text-3xl font-extrabold ${stat.text} mt-1`}>{stat.value}</div>
      </div>
    </div>
  );
}
