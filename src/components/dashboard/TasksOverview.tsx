import { Link } from "react-router-dom";
import { Inbox, Loader2, Eye, CheckCircle2, ListTodo } from "lucide-react";
import { useTasks } from "../../lib/taskStore";

const columns = [
  { key: "todo", label: "قائمة", icon: Inbox, color: "bg-slate-100 text-slate-700", bar: "bg-slate-400" },
  { key: "doing", label: "قيد التنفيذ", icon: Loader2, color: "bg-blue-100 text-blue-700", bar: "bg-blue-400" },
  { key: "review", label: "للمراجعة", icon: Eye, color: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
  { key: "done", label: "مكتملة", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-400" },
] as const;

export default function TasksOverview() {
  const { tasks } = useTasks();
  const active = tasks.filter((t) => !t.archived);
  const counts: Record<string, number> = {
    todo: active.filter((t) => t.status === "todo").length,
    doing: active.filter((t) => t.status === "doing").length,
    review: active.filter((t) => t.status === "review").length,
    done: active.filter((t) => t.status === "done").length,
  };
  const total = active.length;
  const completionRate = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <Link
          to="/tasks"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          إدارة المهام ←
        </Link>
        <div className="text-right">
          <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
            المهام
            <ListTodo className="w-4 h-4 text-brand-500" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {total} مهمة · معدل الإنجاز <bdi dir="ltr">{completionRate}%</bdi>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {columns.map((col) => {
          const Icon = col.icon;
          const count = counts[col.key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <Link
              key={col.key}
              to="/tasks"
              className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg ${col.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{col.label}</div>
                  <div className="text-2xl font-extrabold text-slate-800 mt-0.5">
                    <bdi dir="ltr">{count}</bdi>
                  </div>
                </div>
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${col.bar} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
