import { useState } from "react";
import { Table2, Calendar, Clock4, LayoutGrid, FileSpreadsheet, Printer, CalendarCheck, CalendarX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type View = { key: string; label: string; icon: LucideIcon };

const views: View[] = [
  { key: "table", label: "جدول", icon: Table2 },
  { key: "calendar", label: "تقويم", icon: Calendar },
  { key: "timeline", label: "خط زمني", icon: Clock4 },
  { key: "cards", label: "بطاقات", icon: LayoutGrid },
];

const filters: View[] = [
  { key: "all", label: "جميع المواعيد", icon: CalendarCheck },
  { key: "ended", label: "مواعيد منتهية", icon: CalendarX },
];

export default function ViewToolbar() {
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm font-bold shadow hover:bg-violet-600">
          <FileSpreadsheet className="w-4 h-4" />
          تصدير Excel
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <Printer className="w-4 h-4" />
          طباعة
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-card">
          {views.map((v) => {
            const Icon = v.icon;
            const active = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                  active
                    ? "bg-brand-500 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>{v.label}</span>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-card">
          {filters.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                  active
                    ? "bg-brand-500 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
