import { Calendar, AlertOctagon, Clock } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import { useTasks } from "../../lib/taskStore";

function todayStrings() {
  const now = new Date();
  const greg = now.toLocaleDateString("en-GB").replace(/\//g, "/");
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  return { greg: greg.split("/").reverse().join("/"), hijri };
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};
const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

export default function TodaySessions() {
  const { greg, hijri } = todayStrings();
  const { tasks } = useTasks();

  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today && t.status !== "done" && !t.archived
  );

  return (
    <SectionCard
      title="جلسات اليوم"
      subtitle={`${greg} – ${hijri} هـ - الجلسات المجدولة`}
    >
      {todayTasks.length === 0 ? (
        <EmptyState icon={Calendar} text="لا توجد جلسات مجدولة لليوم" />
      ) : (
        <ul className="space-y-2">
          {todayTasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  priorityColors[t.priority] ?? priorityColors.medium
                }`}
              >
                {t.priority === "urgent" && <AlertOctagon className="w-3 h-3" />}
                {priorityLabels[t.priority] ?? t.priority}
              </span>
              <div className="flex-1 text-right">
                <div className="text-sm font-bold text-slate-700">{t.title}</div>
                {t.description && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {t.description}
                  </div>
                )}
              </div>
              <Clock className="w-4 h-4 text-slate-300" />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
