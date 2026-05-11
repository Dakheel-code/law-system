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
import { useClients } from "../../lib/clientStore";
import { useCases } from "../../lib/caseStore";
import { useTasks } from "../../lib/taskStore";

type Item = { title: string; value: number; icon: LucideIcon; bg: string };

export default function ClientsKpiStrip() {
  const { clients } = useClients();
  const { cases } = useCases();
  const { tasks } = useTasks();

  const total = clients.length;
  const withAccount = clients.filter((c) => c.email).length;
  const withoutAccount = total - withAccount;
  const requests = cases.filter((c) => c.status === "pending" || c.status === "request").length;
  const allCases = cases.length;
  const sessions = cases.filter((c) => c.startDate).length;
  const consultations = cases.filter((c) => c.caseType === "consultation").length;
  const appointments =
    tasks.filter((t) => t.dueDate && !t.archived).length +
    cases.filter((c) => c.startDate).length;

  const items: Item[] = [
    { title: "إجمالي العملاء", value: total, icon: Users, bg: "from-sky-500 to-sky-600" },
    { title: "مسجلون", value: withAccount, icon: ShieldCheck, bg: "from-emerald-500 to-emerald-600" },
    { title: "بدون حساب", value: withoutAccount, icon: UserPlus, bg: "from-violet-500 to-violet-600" },
    { title: "الطلبات", value: requests, icon: FileText, bg: "from-cyan-500 to-cyan-600" },
    { title: "القضايا", value: allCases, icon: Briefcase, bg: "from-emerald-700 to-emerald-800" },
    { title: "الجلسات", value: sessions, icon: Calendar, bg: "from-blue-600 to-blue-700" },
    { title: "الاستشارات", value: consultations, icon: MessageSquare, bg: "from-amber-400 to-amber-500" },
    { title: "المواعيد", value: appointments, icon: Clock, bg: "from-orange-500 to-orange-600" },
  ];

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
