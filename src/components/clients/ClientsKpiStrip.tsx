import {
  Clock,
  MessageSquare,
  Calendar,
  Briefcase,
  FileText,
  UserPlus,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { title: string; value: number; icon: LucideIcon; bg: string };

const items: Item[] = [
  { title: "إجمالي العملاء", value: 0, icon: Users, bg: "from-sky-500 to-sky-600" },
  { title: "مسجلون", value: 0, icon: ShieldCheck, bg: "from-emerald-500 to-emerald-600" },
  { title: "بدون حساب", value: 0, icon: UserPlus, bg: "from-violet-500 to-violet-600" },
  { title: "الطلبات", value: 0, icon: FileText, bg: "from-cyan-500 to-cyan-600" },
  { title: "القضايا", value: 0, icon: Briefcase, bg: "from-emerald-700 to-emerald-800" },
  { title: "الجلسات", value: 0, icon: Calendar, bg: "from-blue-600 to-blue-700" },
  { title: "الاستشارات", value: 0, icon: MessageSquare, bg: "from-amber-400 to-amber-500" },
  { title: "المواعيد", value: 0, icon: Clock, bg: "from-orange-500 to-orange-600" },
];

export default function ClientsKpiStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.title}
            className={`relative overflow-hidden rounded-xl text-white p-3 shadow-card bg-gradient-to-l ${it.bg}`}
          >
            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <Icon className="w-4 h-4 opacity-90" />
              <div className="text-right">
                <div className="text-[11px] opacity-90">{it.title}</div>
                <div className="text-2xl font-extrabold leading-tight">{it.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
