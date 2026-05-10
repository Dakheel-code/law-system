import {
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  UserCheck,
  Wallet,
  Target,
  Briefcase,
  Folder,
  AlertOctagon,
  PauseCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCases } from "../../lib/caseStore";
import { useClients } from "../../lib/clientStore";
import { useContracts } from "../../lib/contractStore";
import { useTasks } from "../../lib/taskStore";

type KPI = {
  title: string;
  value: string;
  icon: LucideIcon;
  bg: string;
};

const sumServices = (services: { qty: number; price: number }[]) =>
  services.reduce((s, x) => s + x.qty * x.price, 0);

export default function ReportsKpis({ tab }: { tab: string }) {
  const { cases } = useCases();
  const { clients } = useClients();
  const { contracts } = useContracts();
  const { tasks } = useTasks();

  let items: KPI[] = [];

  if (tab === "requests" || tab === "cases") {
    const total = cases.length;
    const completed = cases.filter((c) => c.status === "ended" || c.status === "completed").length;
    const avgDays =
      total > 0
        ? Math.round(
            cases.reduce((s, c) => {
              const start = new Date(c.createdAt).getTime();
              return s + (Date.now() - start) / (1000 * 60 * 60 * 24);
            }, 0) / total
          )
        : 0;
    const conversion = total > 0 ? Math.round((completed / total) * 100) : 0;

    items = [
      { title: tab === "requests" ? "إجمالي الطلبات" : "إجمالي القضايا", value: String(total), icon: FileText, bg: "from-sky-400 to-sky-500" },
      { title: tab === "requests" ? "الطلبات المكتملة" : "القضايا المكتملة", value: String(completed), icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
      { title: "متوسط وقت المعالجة", value: `${avgDays} يوم`, icon: Clock, bg: "from-violet-500 to-violet-600" },
      { title: tab === "requests" ? "معدل التحويل للقضايا" : "نسبة الإنجاز", value: `${conversion}%`, icon: TrendingUp, bg: "from-teal-600 to-brand-600" },
    ];
  } else if (tab === "clients") {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const individuals = clients.filter((c) => c.clientType === "individual").length;
    const orgs = clients.filter((c) => c.clientType !== "individual").length;
    items = [
      { title: "إجمالي العملاء", value: String(total), icon: Users, bg: "from-sky-400 to-sky-500" },
      { title: "العملاء النشطون", value: String(active), icon: UserCheck, bg: "from-emerald-500 to-emerald-600" },
      { title: "أفراد", value: String(individuals), icon: Users, bg: "from-violet-500 to-violet-600" },
      { title: "شركات/جهات", value: String(orgs), icon: Briefcase, bg: "from-teal-600 to-brand-600" },
    ];
  } else if (tab === "payments") {
    const totalValue = contracts.reduce((s, c) => s + sumServices(c.services), 0);
    const activeContracts = contracts.filter((c) => c.status === "active");
    const collected = activeContracts.reduce((s, c) => s + sumServices(c.services), 0);
    const pending = totalValue - collected;
    const collectionRate = totalValue > 0 ? Math.round((collected / totalValue) * 100) : 0;
    items = [
      { title: "إجمالي قيمة العقود", value: totalValue.toLocaleString("en-US"), icon: Wallet, bg: "from-sky-400 to-sky-500" },
      { title: "المحصّل (نشط)", value: collected.toLocaleString("en-US"), icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
      { title: "معلّق", value: pending.toLocaleString("en-US"), icon: AlertOctagon, bg: "from-rose-500 to-rose-600" },
      { title: "نسبة التحصيل", value: `${collectionRate}%`, icon: Target, bg: "from-teal-600 to-brand-600" },
    ];
  }

  // suppress unused warning
  void tasks;

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

export function ReportsMiniStats({ tab }: { tab: string }) {
  const { cases } = useCases();
  const { clients } = useClients();
  const { contracts } = useContracts();
  const { tasks } = useTasks();

  let stats: { label: string; value: string; color: string }[] = [];

  if (tab === "requests" || tab === "cases") {
    stats = [
      { label: "نشطة", value: String(cases.filter((c) => c.status === "active").length), color: "text-sky-600" },
      { label: "عاجلة", value: String(cases.filter((c) => c.urgency === "high" || c.urgency === "critical").length), color: "text-rose-600" },
      { label: "متوسطة", value: String(cases.filter((c) => c.priority === "medium").length), color: "text-amber-600" },
      { label: "حقوقية", value: String(cases.filter((c) => c.caseType === "civil").length), color: "text-emerald-600" },
      { label: "تجارية", value: String(cases.filter((c) => c.caseType === "commercial").length), color: "text-violet-600" },
      { label: "عمالية", value: String(cases.filter((c) => c.caseType === "labor").length), color: "text-slate-600" },
    ];
  } else if (tab === "clients") {
    stats = [
      { label: "أفراد", value: String(clients.filter((c) => c.clientType === "individual").length), color: "text-sky-600" },
      { label: "قطاع خاص", value: String(clients.filter((c) => c.clientType === "private").length), color: "text-emerald-600" },
      { label: "مؤسسات", value: String(clients.filter((c) => c.clientType === "institution").length), color: "text-violet-600" },
      { label: "حكومي", value: String(clients.filter((c) => c.clientType === "government").length), color: "text-amber-600" },
      { label: "شبه حكومي", value: String(clients.filter((c) => c.clientType === "semi-government").length), color: "text-rose-600" },
      { label: "نشطون", value: String(clients.filter((c) => c.status === "active").length), color: "text-slate-700" },
    ];
  } else if (tab === "payments") {
    const totalContracts = contracts.length;
    const drafts = contracts.filter((c) => c.status === "draft").length;
    const active = contracts.filter((c) => c.status === "active").length;
    const ended = contracts.filter((c) => c.status === "ended").length;
    stats = [
      { label: "إجمالي العقود", value: String(totalContracts), color: "text-sky-600" },
      { label: "نشطة", value: String(active), color: "text-emerald-600" },
      { label: "مسودات", value: String(drafts), color: "text-amber-600" },
      { label: "منتهية", value: String(ended), color: "text-slate-600" },
      { label: "بانتظار التسديد", value: String(drafts), color: "text-rose-600" },
      { label: "متوسط القيمة", value: totalContracts > 0
          ? Math.round(contracts.reduce((s, c) => s + sumServices(c.services), 0) / totalContracts).toLocaleString("en-US")
          : "0", color: "text-violet-600" },
    ];
  }

  void tasks;

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

// Suppress unused warnings on imports
void [Briefcase, Folder, AlertOctagon, PauseCircle, UserCheck];
