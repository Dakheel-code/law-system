import { Briefcase, Users, FileSignature, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useCases } from "../../lib/caseStore";
import { useContracts } from "../../lib/contractStore";
import { useClients } from "../../lib/clientStore";
import { useTasks } from "../../lib/taskStore";

type KPI = {
  title: string;
  value: number;
  delta: string;
  icon: LucideIcon;
  to: string;
  iconBg: string;
  iconColor: string;
};

export default function KPICards() {
  const { cases } = useCases();
  const { contracts } = useContracts();
  const { clients } = useClients();
  const { tasks } = useTasks();

  const activeCases = cases.filter((c) => c.status === "active").length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const activeTasks = tasks.filter(
    (t) => !t.archived && t.status !== "done"
  ).length;

  const items: KPI[] = [
    {
      title: "العملاء",
      value: clients.length,
      delta: `${clients.filter((c) => c.email).length} مسجّل`,
      icon: Users,
      to: "/clients",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    {
      title: "القضايا",
      value: cases.length,
      delta: `${activeCases} نشطة`,
      icon: Briefcase,
      to: "/cases",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "العقود",
      value: contracts.length,
      delta: `${activeContracts} سارية`,
      icon: FileSignature,
      to: "/contracts",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "المهام",
      value: tasks.filter((t) => !t.archived).length,
      delta: `${activeTasks} قيد العمل`,
      icon: ListTodo,
      to: "/tasks",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.title}
            to={it.to}
            className="card p-4 hover:border-brand-200 hover:shadow-card-hover transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${it.iconBg} ${it.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{it.title}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-0.5">
                  <bdi dir="ltr">{it.value}</bdi>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  {it.delta}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
