import { useMemo } from "react";
import {
  Calendar,
  Briefcase,
  ListTodo,
  FileText,
  CheckCircle2,
  X,
  Users as UsersIcon,
} from "lucide-react";
import {
  eventTypeLabel,
  useCalendarEvents,
  type CalendarEventType,
} from "../../lib/calendarEvents";
import { useUsers, type UserRecord } from "../../lib/userStore";

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
  const { users } = useUsers();
  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

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
            const assignees = (e.assigneeIds ?? [])
              .map((id) => userById.get(id))
              .filter((u): u is UserRecord => !!u);
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
                  {assignees.length > 0 && (
                    <div className="flex items-center justify-end gap-1.5 mt-1.5 flex-wrap">
                      <UsersIcon className="w-3 h-3 text-slate-400" />
                      <div
                        className="flex items-center -space-x-1.5 -space-x-reverse"
                        dir="ltr"
                      >
                        {assignees.slice(0, 3).map((u) => (
                          <span
                            key={u.id}
                            title={u.fullName || u.code}
                            className="w-5 h-5 rounded-full ring-2 ring-white overflow-hidden shrink-0"
                          >
                            {u.avatarDataUrl ? (
                              <img
                                src={u.avatarDataUrl}
                                alt={u.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="w-full h-full bg-brand-100 text-brand-700 text-[9px] font-bold flex items-center justify-center">
                                {(
                                  u.firstName?.[0] ||
                                  u.fullName?.[0] ||
                                  "؟"
                                ).toUpperCase()}
                              </span>
                            )}
                          </span>
                        ))}
                        {assignees.length > 3 && (
                          <span className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                            +{assignees.length - 3}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px] text-slate-600 font-bold truncate"
                        title={assignees.map((u) => u.fullName).join("، ")}
                      >
                        {assignees.length === 1
                          ? assignees[0].fullName || assignees[0].code
                          : `${assignees.length} مكلَّفون`}
                      </span>
                    </div>
                  )}
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
