import { Gavel, MessageSquare, FileSignature, Heart, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Chip = { label: string; count: number; icon: LucideIcon; color: string };

const chips: Chip[] = [
  { label: "جلسة", count: 0, icon: Gavel, color: "text-emerald-500" },
  { label: "استشارة", count: 0, icon: MessageSquare, color: "text-amber-500" },
  { label: "كتابة عدل", count: 0, icon: FileSignature, color: "text-orange-500" },
  { label: "عقد زواج", count: 0, icon: Heart, color: "text-rose-500" },
  { label: "مهمة", count: 0, icon: ListTodo, color: "text-violet-500" },
];

export default function TypeChips() {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {chips.map((c) => {
        const Icon = c.icon;
        return (
          <span
            key={c.label}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm shadow-sm"
          >
            <span className="text-xs text-slate-500 font-bold">{c.count}</span>
            <span className="text-slate-700">{c.label}</span>
            <Icon className={`w-4 h-4 ${c.color}`} />
          </span>
        );
      })}
    </div>
  );
}
