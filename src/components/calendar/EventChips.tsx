import { Plus } from "lucide-react";

const chips: { label: string; color: string }[] = [
  { label: "جلسة مجدولة", color: "bg-emerald-500" },
  { label: "جلسة منتهية", color: "bg-slate-400" },
  { label: "جلسة مؤجلة", color: "bg-amber-500" },
  { label: "استشارة", color: "bg-sky-500" },
  { label: "كتابة عدل", color: "bg-orange-500" },
  { label: "حدث شخصي", color: "bg-violet-500" },
  { label: "حدث عام", color: "bg-blue-500" },
  { label: "رقم هجري", color: "bg-rose-500" },
];

export default function EventChips() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
        <Plus className="w-4 h-4" />
        إضافة حدث
      </button>
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm"
        >
          <span>{c.label}</span>
          <span className={`w-2 h-2 rounded-full ${c.color}`} />
        </span>
      ))}
    </div>
  );
}
