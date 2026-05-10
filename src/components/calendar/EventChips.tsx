import { Plus } from "lucide-react";
import { useCalendarEvents } from "../../lib/calendarEvents";

export default function EventChips() {
  const { events } = useCalendarEvents();

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
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
        <Plus className="w-4 h-4" />
        إضافة حدث
      </button>
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
