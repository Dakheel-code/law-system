import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { buildMonthGrid, isSameDay, hijriDay, hijriMonthYear, gregMonthYear } from "../../lib/hijri";
import { useCalendarEvents } from "../../lib/calendarEvents";

const weekdays = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

const colorBg: Record<string, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

export default function DashboardCalendar() {
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

  const isoOf = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <Link
          to="/calendar"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          عرض كامل ←
        </Link>
        <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
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
          <div className="text-[10px] text-slate-400 font-normal">{gregMonthYear(ref)}</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-slate-400 py-1">
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
          return (
            <Link
              key={i}
              to="/calendar"
              className={`relative aspect-square rounded-md flex flex-col items-center justify-center text-center transition ${
                isToday
                  ? "bg-brand-500 text-white font-bold shadow-sm"
                  : inMonth
                  ? "hover:bg-slate-100 text-slate-700"
                  : "text-slate-300"
              }`}
              title={`${iso} • ${events.length} حدث`}
            >
              <div className="text-[11px] leading-none">{dayNum}</div>
              {inMonth && (
                <div className={`text-[8px] leading-none mt-0.5 ${isToday ? "text-white/80" : "text-rose-400"}`}>
                  {hijri}
                </div>
              )}
              {events.length > 0 && inMonth && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1 h-1 rounded-full ${
                        isToday ? "bg-white" : colorBg[e.color] ?? "bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
