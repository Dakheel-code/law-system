import { useState } from "react";
import { Plus, Briefcase, FileText, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { useCalendarEvents } from "../../lib/calendarEvents";

export default function EventChips() {
  const { events } = useCalendarEvents();
  const [addOpen, setAddOpen] = useState(false);

  const counts = {
    task: events.filter((e) => e.type === "task").length,
    "case-start": events.filter((e) => e.type === "case-start").length,
    "case-end": events.filter((e) => e.type === "case-end").length,
    "contract-start": events.filter((e) => e.type === "contract-start").length,
    "contract-end": events.filter((e) => e.type === "contract-end").length,
  };

  const chips: { label: string; color: string; count: number }[] = [
    { label: "مهام", color: "bg-violet-500", count: counts.task },
    { label: "بداية قضية", color: "bg-sky-500", count: counts["case-start"] },
    { label: "انتهاء قضية", color: "bg-amber-500", count: counts["case-end"] },
    { label: "بداية عقد", color: "bg-emerald-500", count: counts["contract-start"] },
    { label: "انتهاء عقد", color: "bg-rose-500", count: counts["contract-end"] },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          إضافة حدث
        </button>
        {addOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setAddOpen(false)}
            />
            <div
              data-testid="add-event-menu"
              className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-card-hover z-20 overflow-hidden"
            >
              <Link
                to="/tasks"
                onClick={() => setAddOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
              >
                <ListTodo className="w-4 h-4 text-violet-500" />
                مهمة جديدة
              </Link>
              <Link
                to="/cases/new"
                onClick={() => setAddOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
              >
                <Briefcase className="w-4 h-4 text-sky-500" />
                قضية جديدة
              </Link>
              <Link
                to="/contracts/new"
                onClick={() => setAddOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                عقد جديد
              </Link>
            </div>
          </>
        )}
      </div>
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm"
        >
          <span className="text-slate-500 font-bold">{c.count}</span>
          <span>{c.label}</span>
          <span className={`w-2 h-2 rounded-full ${c.color}`} />
        </span>
      ))}
    </div>
  );
}
