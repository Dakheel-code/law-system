import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Briefcase,
  ListTodo,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  buildMonthGrid,
  isSameDay,
  hijriDay,
  hijriMonthYear,
  gregMonthYear,
  toLocalISO,
} from "../../lib/hijri";
import {
  useCalendarEvents,
  eventTypeLabel,
  type CalendarEventType,
} from "../../lib/calendarEvents";

const weekdays = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

const colorBg: Record<string, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

const eventChip: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
};

const eventIcon: Record<
  CalendarEventType,
  React.ComponentType<{ className?: string }>
> = {
  task: ListTodo,
  "case-start": Briefcase,
  "case-end": CheckCircle2,
  session: Briefcase,
  "contract-start": FileText,
  "contract-end": X,
};

const isoOf = (d: Date) => toLocalISO(d);

const formatSelectedDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function DashboardCalendar() {
  const [ref, setRef] = useState(() => new Date());
  const today = new Date();
  const [selectedIso, setSelectedIso] = useState<string | null>(() =>
    isoOf(new Date())
  );
  const { byDate } = useCalendarEvents();
  const cells = useMemo(() => buildMonthGrid(ref), [ref]);

  const prev = () => {
    const d = new Date(ref);
    d.setMonth(d.getMonth() - 1);
    setRef(d);
  };
  const next = () => {
    const d = new Date(ref);
    d.setMonth(d.getMonth() + 1);
    setRef(d);
  };
  const goToday = () => {
    const t = new Date();
    setRef(t);
    setSelectedIso(isoOf(t));
  };

  const selectedEvents = selectedIso ? byDate.get(selectedIso) ?? [] : [];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        {selectedIso && (
          <button
            type="button"
            onClick={() => setSelectedIso(null)}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            title="إلغاء التحديد"
          >
            إلغاء التحديد
          </button>
        )}
        <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800 mr-auto">
          التقويم
          <CalendarIcon className="w-4 h-4 text-brand-500" />
        </h3>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center"
            aria-label="السابق"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={goToday}
            className="px-2 py-1 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100"
          >
            اليوم
          </button>
          <button
            onClick={next}
            className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center"
            aria-label="التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-xs font-bold text-slate-700 text-center">
          <bdi dir="rtl">{hijriMonthYear(ref)}</bdi>
          <div className="text-[10px] text-slate-400 font-normal">
            {gregMonthYear(ref)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-bold text-slate-400 py-1"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ date, inMonth }, i) => {
          const isToday = isSameDay(date, today);
          const iso = isoOf(date);
          const events = byDate.get(iso) ?? [];
          const dayNum = date.getDate();
          const hijri = hijriDay(date);
          const isSelected = selectedIso === iso;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIso(iso)}
              className={`relative aspect-square rounded-md flex flex-col items-center justify-center text-center transition ${
                isSelected
                  ? "ring-2 ring-brand-500 ring-offset-1 bg-brand-50 text-brand-700 font-bold"
                  : isToday
                  ? "bg-brand-500 text-white font-bold shadow-sm"
                  : inMonth
                  ? "hover:bg-slate-100 text-slate-700"
                  : "text-slate-300"
              }`}
              title={`${iso} • ${events.length} حدث`}
            >
              <div className="text-[11px] leading-none">{dayNum}</div>
              {inMonth && (
                <div
                  className={`text-[8px] leading-none mt-0.5 ${
                    isToday && !isSelected ? "text-white/80" : "text-rose-400"
                  }`}
                >
                  {hijri}
                </div>
              )}
              {events.length > 0 && inMonth && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1 h-1 rounded-full ${
                        isToday && !isSelected
                          ? "bg-white"
                          : colorBg[e.color] ?? "bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events — inline, no navigation */}
      {selectedIso && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400">
              {selectedEvents.length === 0
                ? "لا توجد مواعيد"
                : `${selectedEvents.length} موعد`}
            </span>
            <div className="text-xs font-bold text-slate-700 text-right">
              {formatSelectedDate(selectedIso)}
            </div>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400">
              يوم خالٍ من المواعيد
            </div>
          ) : (
            <ul className="space-y-1.5">
              {selectedEvents.map((e) => {
                const Icon = eventIcon[e.type];
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-slate-50/50 border border-slate-100"
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <div
                        className="text-xs font-bold text-slate-700 truncate"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                        <span>{eventTypeLabel(e.type)}</span>
                        {e.meta && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono" dir="ltr">
                              {e.meta}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        eventChip[e.color] ?? eventChip.violet
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
