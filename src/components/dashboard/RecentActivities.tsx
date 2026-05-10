import { Clock, Briefcase, Users, FileText, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import { useCases } from "../../lib/caseStore";
import { useClients } from "../../lib/clientStore";
import { useContracts } from "../../lib/contractStore";
import { useTasks } from "../../lib/taskStore";

type Props = { title?: string; subtitle?: string };

type Activity = {
  icon: LucideIcon;
  text: string;
  time: string;
  color: string;
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `قبل ${days} يوم`;
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    month: "short",
    day: "numeric",
  });
};

export default function RecentActivities({
  title = "آخر النشاطات",
  subtitle = "أحدث التغييرات",
}: Props) {
  const { cases } = useCases();
  const { clients } = useClients();
  const { contracts } = useContracts();
  const { tasks } = useTasks();

  const activities: Activity[] = [
    ...cases.slice(0, 3).map((c) => ({
      icon: Briefcase,
      text: `قضية جديدة: ${c.requestTitle || c.code}`,
      time: formatRelative(c.createdAt),
      color: "bg-sky-100 text-sky-600",
    })),
    ...clients.slice(0, 3).map((c) => ({
      icon: Users,
      text: `عميل جديد: ${c.fullName}`,
      time: formatRelative(c.createdAt),
      color: "bg-emerald-100 text-emerald-600",
    })),
    ...contracts.slice(0, 3).map((c) => ({
      icon: FileText,
      text: `عقد جديد: ${c.title}`,
      time: formatRelative(c.createdAt),
      color: "bg-violet-100 text-violet-600",
    })),
    ...tasks.slice(0, 3).map((t) => ({
      icon: ListChecks,
      text: `مهمة: ${t.title}`,
      time: formatRelative(t.createdAt),
      color: "bg-amber-100 text-amber-600",
    })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 8);

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {activities.length === 0 ? (
        <EmptyState icon={Clock} text="لا توجد نشاطات حديثة" />
      ) : (
        <ul className="space-y-2">
          {activities.map((a, i) => {
            const Icon = a.icon;
            return (
              <li
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50"
              >
                <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                <div className="flex-1 text-right text-sm text-slate-700 truncate">
                  {a.text}
                </div>
                <div
                  className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
