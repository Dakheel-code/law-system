import { Briefcase, ClipboardList, Wallet, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCases } from "../../lib/caseStore";
import { useContracts } from "../../lib/contractStore";
import { useUsers } from "../../lib/userStore";
import { useClients } from "../../lib/clientStore";

type KPI = {
  title: string;
  value: string;
  sub: string;
  progress: number;
  icon: LucideIcon;
  bg: string;
};

const sumServices = (services: { qty: number; price: number }[]) =>
  services.reduce((s, x) => s + x.qty * x.price, 0);

export default function KPICards() {
  const { cases } = useCases();
  const { contracts } = useContracts();
  const { users } = useUsers();
  const { clients } = useClients();

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "active").length;
  const casesPct = totalCases > 0 ? Math.round((activeCases / totalCases) * 100) : 0;

  const totalRequests = cases.length; // requests treated as cases
  const pendingRequests = cases.filter((c) => c.status === "active").length;
  const requestsPct =
    totalRequests > 0 ? Math.round((pendingRequests / totalRequests) * 100) : 0;

  // Revenue = paid contracts (those marked "active")
  const revenue = contracts
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + sumServices(c.services), 0);

  const lawyersCount = users.filter((u) => u.type === "lawyer" && u.status === "active").length;

  // Pending dues = total contracts value (rough estimate)
  const pendingDues = contracts.reduce((s, c) => s + sumServices(c.services), 0) - revenue;

  const items: KPI[] = [
    {
      title: "إجمالي القضايا",
      value: String(totalCases),
      sub: `نشطة ${activeCases}`,
      progress: casesPct,
      icon: Briefcase,
      bg: "from-sky-400 to-sky-500",
    },
    {
      title: "إجمالي الطلبات",
      value: String(totalRequests),
      sub: `بانتظار الإجراء ${pendingRequests}`,
      progress: requestsPct,
      icon: ClipboardList,
      bg: "from-teal-500 to-brand-500",
    },
    {
      title: "الإيرادات (ر.س)",
      value: revenue.toLocaleString("en-US"),
      sub: `${lawyersCount} محامي · ${contracts.length} عقد`,
      progress: 100,
      icon: Wallet,
      bg: "from-emerald-400 to-emerald-500",
    },
    {
      title: "مستحقات معلقة (ر.س)",
      value: pendingDues.toLocaleString("en-US"),
      sub: `${clients.length} عميل`,
      progress: pendingDues > 0 ? 60 : 0,
      icon: AlertCircle,
      bg: "from-rose-400 to-rose-500",
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
                <div
                  className="h-full bg-white"
                  style={{ width: `${it.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
