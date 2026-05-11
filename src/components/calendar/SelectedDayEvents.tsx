import {
  Calendar,
  Briefcase,
  ListTodo,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  eventTypeLabel,
  useCalendarEvents,
  type CalendarEventType,
} from "../../lib/calendarEvents";

const iconMap: Record<CalendarEventType, React.ComponentType<{ className?: string }>> = {
  task: ListTodo,
  "case-start": Briefcase,
  "case-end": CheckCircle2,
  session: Briefcase,
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

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG-u-nu-latn", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatHijri = (iso: string) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
};

type Props = {
  date: string | null;
  onClose: () => void;
};

export default function SelectedDayEvents({ date, onClose }: Props) {
  const { byDate } = useCalendarEvents();

  if (!date) {
    return (
      <div className="card p-5 lg:sticky lg:top-24">
        <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
          أحداث اليوم المحدّد
          <Calendar className="w-4 h-4 text-brand-500" />
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
          <Calendar className="w-12 h-12 mb-3" strokeWidth={1.2} />
          <p className="text-sm text-slate-500">اختر يوماً من التقويم</p>
          <p className="text-xs text-slate-400 mt-1">لعرض أحداثه</p>
        </div>
      </div>
    );
  }

  const events = byDate.get(date) ?? [];

  return (
    <div className="card p-5 lg:sticky lg:top-24">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-right">
          <h3 className="text-sm font-bold text-slate-800">{formatDate(date)}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{formatHijri(date)} هـ</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {events.length === 0 ? "لا توجد أحداث" : `${events.length} حدث`}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
          <Calendar className="w-12 h-12 mb-3" strokeWidth={1.2} />
          <p className="text-sm text-slate-500">يوم خالٍ من المواعيد</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => {
            const Icon = iconMap[e.type];
            return (
              <li
                key={e.id}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-bold text-slate-700 truncate">
                    {e.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eventTypeLabel(e.type)}
                    {e.meta ? <span className="font-mono ml-1" dir="ltr">· {e.meta}</span> : null}
                  </div>
                </div>
                <div
                  className={`w-9 h-9 rounded-lg ${colorMap[e.color] ?? colorMap.violet} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
