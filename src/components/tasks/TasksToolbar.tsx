import { useState } from "react";
import {
  LayoutGrid,
  User,
  ArrowLeftRight,
  Users,
  Archive,
  Plus,
  KanbanSquare,
  Table2,
  ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tabs: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "الكل", icon: LayoutGrid },
  { key: "mine", label: "مهامي", icon: User },
  { key: "assigned", label: "موجهة لي", icon: ArrowLeftRight },
  { key: "general", label: "مهام عامة", icon: Users },
  { key: "archive", label: "المؤرشفة", icon: Archive },
];

const views: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "kanban", label: "كانبان", icon: KanbanSquare },
  { key: "table", label: "جدول", icon: Table2 },
  { key: "list", label: "قائمة مهام", icon: ListChecks },
  { key: "ms", label: "Microsoft", icon: LayoutGrid },
];

export default function TasksToolbar() {
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("kanban");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "text-brand-700 border-b-2 border-brand-500 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{t.label}</span>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
          إدارة المهام
          <LayoutGrid className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
          <Plus className="w-4 h-4" />
          مهمة جديدة
        </button>

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
      </div>
    </div>
  );
}
