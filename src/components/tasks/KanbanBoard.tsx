import { Inbox } from "lucide-react";

type Column = { key: string; title: string; color: string; count: number };

const columns: Column[] = [
  { key: "todo", title: "للقيام بها", color: "bg-slate-300 text-slate-700", count: 0 },
  { key: "doing", title: "قيد التنفيذ", color: "bg-sky-500 text-white", count: 0 },
  { key: "review", title: "قيد المراجعة", color: "bg-amber-400 text-white", count: 0 },
  { key: "done", title: "مكتملة", color: "bg-emerald-500 text-white", count: 0 },
];

export default function KanbanBoard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((c) => (
        <div key={c.key} className="bg-slate-50 rounded-2xl p-3 min-h-[400px] border border-slate-200">
          <div className={`flex items-center justify-between rounded-xl ${c.color} px-4 py-2.5 mb-3 shadow`}>
            <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-md">
              {c.count}
            </span>
            <h3 className="text-sm font-extrabold">{c.title}</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-slate-300">
            <Inbox className="w-10 h-10 mb-2" strokeWidth={1.2} />
            <span className="text-xs">لا توجد مهام</span>
          </div>
        </div>
      ))}
    </div>
  );
}
