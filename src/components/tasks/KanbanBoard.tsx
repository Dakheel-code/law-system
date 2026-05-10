import { Inbox, Trash2, Calendar, AlertOctagon } from "lucide-react";
import { useTasks, deleteTask, updateTaskStatus, type TaskStatus, type TaskRecord } from "../../lib/taskStore";

const columns: { key: TaskStatus; title: string; color: string }[] = [
  { key: "todo", title: "للقيام بها", color: "bg-slate-300 text-slate-700" },
  { key: "doing", title: "قيد التنفيذ", color: "bg-sky-500 text-white" },
  { key: "review", title: "قيد المراجعة", color: "bg-amber-400 text-white" },
  { key: "done", title: "مكتملة", color: "bg-emerald-500 text-white" },
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
  });
};

export default function KanbanBoard() {
  const { tasks, loading } = useTasks();

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status && !t.archived);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((c) => {
        const items = tasksByStatus(c.key);
        return (
          <div key={c.key} className="bg-slate-50 rounded-2xl p-3 min-h-[400px] border border-slate-200">
            <div className={`flex items-center justify-between rounded-xl ${c.color} px-4 py-2.5 mb-3 shadow`}>
              <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-md">
                {items.length}
              </span>
              <h3 className="text-sm font-extrabold">{c.title}</h3>
            </div>

            {loading && items.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">جارٍ التحميل...</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <Inbox className="w-10 h-10 mb-2" strokeWidth={1.2} />
                <span className="text-xs">لا توجد مهام</span>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task }: { task: TaskRecord }) {
  const due = formatDate(task.dueDate);
  const isUrgent = task.priority === "urgent";

  const moveNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next: Record<TaskStatus, TaskStatus> = {
      todo: "doing",
      doing: "review",
      review: "done",
      done: "todo",
    };
    updateTaskStatus(task.id, next[task.status]);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`حذف المهمة "${task.title}"؟`)) deleteTask(task.id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow transition group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={handleDelete}
          title="حذف"
          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <h4 className="flex-1 text-sm font-bold text-slate-800 text-right">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 leading-5 line-clamp-2 text-right mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <button
          onClick={moveNext}
          title="نقل للمرحلة التالية"
          className="text-[11px] text-brand-600 hover:text-brand-700 font-bold"
        >
          نقل ←
        </button>
        <div className="flex items-center gap-1.5">
          {due && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              {due}
              <Calendar className="w-3 h-3" />
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${
              priorityColors[task.priority] ?? priorityColors.medium
            }`}
          >
            {isUrgent && <AlertOctagon className="w-3 h-3" />}
            {priorityLabels[task.priority] ?? task.priority}
          </span>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-400 mt-1 text-left" dir="ltr">
        {task.code}
      </div>
    </div>
  );
}
