import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Briefcase,
  ListTodo,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import { useCalendarEvents, type CalendarEventType } from "../../lib/calendarEvents";

const todayStr = () => new Date().toISOString().slice(0, 10);

const iconMap: Record<CalendarEventType, React.ComponentType<{ className?: string }>> = {
  task: ListTodo,
  "case-start": Briefcase,
  "case-end": CheckCircle2,
  "contract-start": FileText,
  "contract-end": X,
};
const colorMap: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
};
const labelMap: Record<CalendarEventType, string> = {
  task: "مهمة",
  "case-start": "بداية قضية",
  "case-end": "انتهاء قضية",
  "contract-start": "بداية عقد",
  "contract-end": "انتهاء عقد",
};

export default function TodayAppointments() {
  const { events } = useCalendarEvents();

  const t = todayStr();
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.date >= t)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [events, t]
  );
  const todayCount = events.filter((e) => e.date === t).length;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <Link
          to="/appointments"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          الكل ←
        </Link>
        <div className="text-right">
          <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
            المواعيد القادمة
            <Clock className="w-4 h-4 text-brand-500" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {todayCount > 0 ? `${todayCount} اليوم` : "لا توجد مواعيد اليوم"}
          </p>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Clock className="w-10 h-10 mb-2" strokeWidth={1.2} />
          <p className="text-xs text-slate-500">لا توجد مواعيد قادمة</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((e) => {
            const Icon = iconMap[e.type];
            const d = new Date(e.date);
            const isToday = e.date === t;
            const dayLabel = isToday
              ? "اليوم"
              : d.toLocaleDateString("ar-EG-u-nu-latn", {
                  day: "numeric",
                  month: "short",
                });
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  isToday
                    ? "border-brand-200 bg-brand-50/40"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${
                    colorMap[e.color] ?? "bg-slate-100 text-slate-600"
                  } flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-bold text-slate-700 truncate">{e.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {labelMap[e.type]}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-md ${
                    isToday
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {dayLabel}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
