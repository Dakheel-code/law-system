import { FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type KPI = {
  title: string;
  value: string;
  icon: LucideIcon;
  bg: string;
};

const items: KPI[] = [
  { title: "إجمالي الطلبات", value: "0", icon: FileText, bg: "from-sky-400 to-sky-500" },
  { title: "الطلبات المكتملة", value: "0", icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
  { title: "متوسط وقت المعالجة", value: "0 يوم", icon: Clock, bg: "from-violet-500 to-violet-600" },
  { title: "معدل التحويل للقضايا", value: "0%", icon: TrendingUp, bg: "from-teal-600 to-brand-600" },
];

export default function ReportsKpis() {
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
            <div className="relative flex items-center justify-between">
              <Icon className="w-6 h-6 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">{it.title}</div>
                <div className="text-3xl font-extrabold mt-2">{it.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportsMiniStats() {
  const stats = [
    { label: "معلقة", value: "0", color: "text-slate-600" },
    { label: "متقية", value: "0", color: "text-rose-600" },
    { label: "مرسلة", value: "0", color: "text-amber-600" },
    { label: "معدل الإنجاز", value: "0%", color: "text-emerald-600" },
    { label: "معدل الإلغاء", value: "0%", color: "text-rose-600" },
    { label: "تحويلات للقضايا", value: "0", color: "text-violet-600" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card px-4 py-3 flex flex-col items-center min-w-[110px]"
        >
          <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
