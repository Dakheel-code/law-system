import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  ListTodo,
  X,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  gregMonthYear,
  hijriDay,
  hijriMonth,
  hijriMonthYear,
  isSameDay,
} from "../../lib/hijri";
import {
  eventTypeLabel,
  useCalendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from "../../lib/calendarEvents";

const weekdays = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

type ViewKey = "month" | "week" | "day" | "list";
const views: { key: ViewKey; label: string }[] = [
  { key: "month", label: "شهر" },
  { key: "week", label: "أسبوع" },
  { key: "day", label: "يوم" },
  { key: "list", label: "قائمة" },
];

const colorBg: Record<string, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};
const colorChip: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
};
const eventIconMap: Record<CalendarEventType, React.ComponentType<{ className?: string }>> = {
  task: ListTodo,
  "case-start": Briefcase,
  "case-end": CheckCircle2,
  "contract-start": FileText,
  "contract-end": X,
};

type Props = {
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
};

const isoOf = (d: Date) => d.toISOString().slice(0, 10);

const startOfWeek = (d: Date) => {
  const out = new Date(d);
  const day = out.getDay(); // Sun=0..Sat=6; we want Sat as start
  const offset = day === 6 ? 0 : day + 1;
  out.setDate(out.getDate() - offset);
  return out;
};

export default function MonthGrid({ selectedDate, onSelectDate }: Props) {
  const [view, setView] = useState<ViewKey>("month");
  const [ref, setRef] = useState(() => new Date());
  const today = new Date();
  const { byDate, events } = useCalendarEvents();

  const navUnit = view === "week" ? "week" : view === "day" ? "day" : "month";

  const prev = () => {
    const d = new Date(ref);
    if (navUnit === "month") d.setMonth(d.getMonth() - 1);
    else if (navUnit === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setRef(d);
  };
  const next = () => {
    const d = new Date(ref);
    if (navUnit === "month") d.setMonth(d.getMonth() + 1);
    else if (navUnit === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setRef(d);
  };
  const goToday = () => setRef(new Date());

  // Title varies by view
  const title =
    view === "month"
      ? `${hijriMonthYear(ref)} | ${gregMonthYear(ref)}`
      : view === "week"
      ? (() => {
          const start = startOfWeek(ref);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${start.toLocaleDateString("ar-EG-u-nu-latn", {
            day: "numeric",
            month: "short",
          })} — ${end.toLocaleDateString("ar-EG-u-nu-latn", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`;
        })()
      : view === "day"
      ? ref.toLocaleDateString("ar-EG-u-nu-latn", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "كل المواعيد القادمة";

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                view === v.key
                  ? "bg-white text-brand-700 font-bold shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className="text-base font-extrabold text-slate-800">
            <bdi dir="rtl">{title}</bdi>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm text-slate-600"
          >
            اليوم
          </button>
          <button
            onClick={next}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "month" && (
        <MonthView
          ref_={ref}
          today={today}
          byDate={byDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      )}
      {view === "week" && (
        <WeekView
          ref_={ref}
          today={today}
          byDate={byDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      )}
      {view === "day" && (
        <DayView ref_={ref} byDate={byDate} />
      )}
      {view === "list" && <ListView events={events} />}
    </div>
  );
}

// ============================================================
// Month View (original grid)
// ============================================================

function MonthView({
  ref_,
  today,
  byDate,
  selectedDate,
  onSelectDate,
}: {
  ref_: Date;
  today: Date;
  byDate: Map<string, CalendarEvent[]>;
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(ref_), [ref_]);

  return (
    <div className="grid grid-cols-7 border-t border-r border-slate-200 rounded-tl-lg overflow-hidden">
      {weekdays.map((d) => (
        <div
          key={d}
          className="bg-slate-50 text-center py-2 text-xs font-bold text-slate-500 border-l border-b border-slate-200"
        >
          {d}
        </div>
      ))}

      {cells.map(({ date, inMonth }, i) => {
        const isToday = isSameDay(date, today);
        const iso = isoOf(date);
        const events = byDate.get(iso) ?? [];
        const hijriDayNum = hijriDay(date);
        const gregDayNum = date.getDate();
        const isFirstOfHijriMonth = hijriDayNum === "١";
        const isSelected = selectedDate === iso;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelectDate(iso)}
            className={`min-h-[88px] border-l border-b border-slate-200 p-2 text-right transition relative ${
              isSelected
                ? "bg-brand-50 ring-2 ring-brand-500 ring-inset"
                : isToday
                ? "bg-sky-50/60"
                : "bg-white hover:bg-slate-50"
            } ${!inMonth ? "opacity-40" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="text-[11px] text-rose-500 font-bold">{hijriDayNum}</div>
              <div
                className={`text-sm font-bold ${
                  isToday ? "text-sky-600" : "text-slate-700"
                }`}
              >
                {gregDayNum}
              </div>
            </div>
            {isFirstOfHijriMonth && (
              <div className="text-[10px] text-rose-500 font-bold mt-1 truncate">
                {hijriMonth(date)}
              </div>
            )}

            {events.length > 0 && (
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 flex-wrap max-w-[80%]">
                {events.slice(0, 4).map((ev) => (
                  <span
                    key={ev.id}
                    className={`w-1.5 h-1.5 rounded-full ${colorBg[ev.color] ?? "bg-slate-400"}`}
                    title={ev.title}
                  />
                ))}
                {events.length > 4 && (
                  <span className="text-[9px] text-slate-500 ml-0.5">
                    +{events.length - 4}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Week View — 7 columns with events listed inside each day
// ============================================================

function WeekView({
  ref_,
  today,
  byDate,
  selectedDate,
  onSelectDate,
}: {
  ref_: Date;
  today: Date;
  byDate: Map<string, CalendarEvent[]>;
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
}) {
  const start = startOfWeek(ref_);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const iso = isoOf(d);
        const events = byDate.get(iso) ?? [];
        const isToday = isSameDay(d, today);
        const isSelected = selectedDate === iso;
        return (
          <button
            key={iso}
            onClick={() => onSelectDate(iso)}
            className={`min-h-[260px] rounded-lg border p-2 text-right transition flex flex-col ${
              isSelected
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                : isToday
                ? "border-sky-300 bg-sky-50/60"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="text-[11px] text-rose-500 font-bold">{hijriDay(d)}</div>
              <div className={`text-xs font-bold ${isToday ? "text-sky-600" : "text-slate-700"}`}>
                <div>{weekdays[(d.getDay() + 1) % 7]}</div>
                <div className="text-lg leading-tight">{d.getDate()}</div>
              </div>
            </div>
            <div className="space-y-1 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-[10px] text-slate-300 text-center py-2">—</div>
              ) : (
                events.map((e) => (
                  <div
                    key={e.id}
                    className={`text-[10px] px-1.5 py-1 rounded ${colorChip[e.color] ?? "bg-slate-100"} truncate`}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Day View — vertical list for the selected day
// ============================================================

function DayView({ ref_, byDate }: { ref_: Date; byDate: Map<string, CalendarEvent[]> }) {
  const iso = isoOf(ref_);
  const events = byDate.get(iso) ?? [];

  return (
    <div>
      <div className="text-sm text-slate-600 text-right mb-3 pb-3 border-b border-slate-100">
        <bdi dir="rtl">
          {hijriDay(ref_)} {hijriMonth(ref_)} — {ref_.toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", day: "numeric", month: "long" })}
        </bdi>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-300">
          <div className="text-sm text-slate-500">لا توجد أحداث في هذا اليوم</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => {
            const Icon = eventIconMap[e.type];
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${colorChip[e.color] ?? "bg-slate-100"} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-bold text-slate-700 truncate">
                    {e.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eventTypeLabel(e.type)}
                    {e.meta && <span className="font-mono ml-1" dir="ltr">· {e.meta}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// List View — chronological list of all upcoming events
// ============================================================

function ListView({ events }: { events: CalendarEvent[] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );
  const upcoming = sorted.filter((e) => e.date >= todayStr);
  const past = sorted.filter((e) => e.date < todayStr);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
        <div className="text-sm text-slate-500">لا توجد أحداث</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {upcoming.length > 0 && (
        <Section title="القادمة" events={upcoming} />
      )}
      {past.length > 0 && (
        <Section title="السابقة" events={past.reverse()} dimmed />
      )}
    </div>
  );
}

function Section({
  title,
  events,
  dimmed = false,
}: {
  title: string;
  events: CalendarEvent[];
  dimmed?: boolean;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-700 mb-2 text-right">
        {title}{" "}
        <span className="text-xs font-normal text-slate-400">({events.length})</span>
      </h4>
      <ul className={`space-y-1.5 ${dimmed ? "opacity-60" : ""}`}>
        {events.map((e) => {
          const Icon = eventIconMap[e.type];
          const d = new Date(e.date);
          const dateLabel = d.toLocaleDateString("ar-EG-u-nu-latn", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return (
            <li
              key={e.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <div
                className={`w-8 h-8 rounded-lg ${colorChip[e.color] ?? "bg-slate-100"} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-sm font-bold text-slate-700 truncate">{e.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {eventTypeLabel(e.type)}
                  {e.meta && <span className="font-mono ml-1" dir="ltr">· {e.meta}</span>}
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium shrink-0">
                <bdi dir="ltr">{dateLabel}</bdi>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
