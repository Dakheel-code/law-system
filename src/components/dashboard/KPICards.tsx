import { Briefcase, ClipboardList, Wallet, AlertCircle, ArrowUpLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type KPI = {
  title: string;
  value: string;
  sub: string;
  progress?: number;
  icon: LucideIcon;
  bg: string;
  hint?: string;
};

const items: KPI[] = [
  {
    title: "إجمالي القضايا",
    value: "0",
    sub: "نشطة 0",
    progress: 0,
    icon: Briefcase,
    bg: "from-sky-400 to-sky-500",
  },
  {
    title: "إجمالي الطلبات",
    value: "0",
    sub: "بانتظار الإجراء 0",
    progress: 0,
    icon: ClipboardList,
    bg: "from-teal-500 to-brand-500",
  },
  {
    title: "الإيرادات (ر.س)",
    value: "0",
    sub: "0 محامي",
    icon: Wallet,
    bg: "from-emerald-400 to-emerald-500",
  },
  {
    title: "مستحقات معلقة (ر.س)",
    value: "0",
    sub: "بحاجة لمتابعة",
    icon: AlertCircle,
    bg: "from-rose-400 to-rose-500",
    hint: "0 عميل",
  },
];

export default function KPICards() {
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
                <span>{it.progress !== undefined ? `${it.progress}%` : ""}</span>
                <span className="opacity-90">{it.sub}</span>
              </div>
              {it.progress !== undefined && (
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${it.progress}%` }}
                  />
                </div>
              )}
              {it.hint && (
                <ArrowUpLeft className="absolute left-0 bottom-0 w-4 h-4 opacity-60" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
