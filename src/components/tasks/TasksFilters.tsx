import { useState } from "react";
import { Search, RotateCcw, Calendar } from "lucide-react";

export default function TasksFilters() {
  const [calendarType, setCalendarType] = useState<"greg" | "hijri">("greg");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 shrink-0">
        <RotateCcw className="w-4 h-4" />
        إعادة تعيين
      </button>

      <div className="relative flex-1 min-w-[150px]">
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="يوم/شهر/سنة"
          className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div className="relative flex-1 min-w-[150px]">
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="يوم/شهر/سنة"
          className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
        <button
          onClick={() => setCalendarType("hijri")}
          className={`px-3 py-1.5 rounded-md text-sm transition ${
            calendarType === "hijri" ? "bg-brand-500 text-white" : "text-slate-500"
          }`}
        >
          هجري
        </button>
        <button
          onClick={() => setCalendarType("greg")}
          className={`px-3 py-1.5 rounded-md text-sm transition ${
            calendarType === "greg" ? "bg-brand-500 text-white" : "text-slate-500"
          }`}
        >
          ميلادي
        </button>
      </div>

      <FilterSelect label="ترتيب / فلترة بالتاريخ" />
      <FilterSelect label="كل المكلفين" />
      <FilterSelect label="كل الحالات" />
      <FilterSelect label="كل الأولويات" />

      <div className="relative flex-1 min-w-[150px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="بحث..."
          className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <select className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200">
      <option>{label}</option>
    </select>
  );
}
