import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  gregMonthYear,
  hijriDay,
  hijriMonth,
  hijriMonthYear,
  isSameDay,
} from "../../lib/hijri";
import { useCalendarEvents } from "../../lib/calendarEvents";

const weekdays = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const views = ["شهر", "أسبوع", "يوم", "قائمة"];

const colorBg: Record<string, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

type Props = {
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
};

const isoOf = (d: Date) => d.toISOString().slice(0, 10);

export default function MonthGrid({ selectedDate, onSelectDate }: Props) {
  const [view, setView] = useState("شهر");
  const [ref, setRef] = useState(() => new Date());
  const today = new Date();
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
  const goToday = () => setRef(new Date());

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                view === v
                  ? "bg-white text-brand-700 font-bold shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className="text-base font-extrabold text-slate-800">
            {hijriMonthYear(ref)} هـ <span className="text-slate-400 mx-1">|</span>{" "}
            {gregMonthYear(ref)}
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
    </div>
  );
}
