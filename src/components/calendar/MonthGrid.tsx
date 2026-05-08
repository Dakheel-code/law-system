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

export default function MonthGrid() {
  const [view, setView] = useState("شهر");
  const [ref, setRef] = useState(() => new Date());
  const today = new Date();

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
          const hijriDayNum = hijriDay(date);
          const gregDayNum = date.getDate();
          const isFirstOfHijriMonth = hijriDayNum === "١";
          return (
            <div
              key={i}
              className={`min-h-[88px] border-l border-b border-slate-200 p-2 text-right transition ${
                isToday ? "bg-sky-50/60" : "bg-white"
              } ${!inMonth ? "opacity-40" : "hover:bg-slate-50"}`}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
