import { useState } from "react";
import { Inbox, Trash2, Calendar, AlertOctagon, GripVertical } from "lucide-react";
import {
  useTasks,
  deleteTask,
  updateTaskStatus,
  type TaskStatus,
  type TaskRecord,
} from "../../lib/taskStore";

const columns: { key: TaskStatus; title: string; color: string; ringColor: string }[] = [
  { key: "todo", title: "للقيام بها", color: "bg-slate-300 text-slate-700", ringColor: "ring-slate-400" },
  { key: "doing", title: "قيد التنفيذ", color: "bg-sky-500 text-white", ringColor: "ring-sky-400" },
  { key: "review", title: "قيد المراجعة", color: "bg-amber-400 text-white", ringColor: "ring-amber-400" },
  { key: "done", title: "مكتملة", color: "bg-emerald-500 text-white", ringColor: "ring-emerald-400" },
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

type DragState = {
  taskId: string;
  from: TaskStatus;
} | null;

export default function KanbanBoard() {
  const { tasks, loading } = useTasks();
  const [drag, setDrag] = useState<DragState>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status && !t.archived);

  const handleDragStart = (taskId: string, from: TaskStatus) => {
    setDrag({ taskId, from });
  };

  const handleDragEnd = () => {
    setDrag(null);
    setOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault();
    if (drag && overColumn !== columnKey) setOverColumn(columnKey);
  };

  const handleDragLeave = (e: React.DragEvent, columnKey: TaskStatus) => {
    // Only clear when actually leaving the column box, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (overColumn === columnKey) setOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault();
    setOverColumn(null);
    if (!drag) return;
    const { taskId, from } = drag;
    setDrag(null);
    if (from === columnKey) return;
    await updateTaskStatus(taskId, columnKey);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((c) => {
        const items = tasksByStatus(c.key);
        const isOver = overColumn === c.key;
        const isSource = drag?.from === c.key;
        return (
          <div
            key={c.key}
            onDragOver={(e) => handleDragOver(e, c.key)}
            onDragEnter={(e) => handleDragOver(e, c.key)}
            onDragLeave={(e) => handleDragLeave(e, c.key)}
            onDrop={(e) => handleDrop(e, c.key)}
            className={`bg-slate-50 rounded-2xl p-3 min-h-[400px] border transition ${
              isOver
                ? `border-transparent ring-2 ${c.ringColor} bg-white shadow-inner`
                : "border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between rounded-xl ${c.color} px-4 py-2.5 mb-3 shadow`}
            >
              <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-md">
                {items.length}
              </span>
              <h3 className="text-sm font-extrabold">{c.title}</h3>
            </div>

            {loading && items.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                جارٍ التحميل...
              </div>
            ) : items.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center h-64 transition ${
                  isOver && drag && !isSource ? "text-brand-500" : "text-slate-300"
                }`}
              >
                <Inbox className="w-10 h-10 mb-2" strokeWidth={1.2} />
                <span className="text-xs">
                  {isOver && drag && !isSource ? "أفلت هنا" : "لا توجد مهام"}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    isDragging={drag?.taskId === t.id}
                    onDragStart={() => handleDragStart(t.id, t.status)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {/* Drop hint when target column is empty of incoming-zone area */}
                {isOver && drag && !isSource && (
                  <div className="rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/40 text-brand-600 text-xs text-center py-3">
                    أفلت لنقل المهمة إلى «{c.title}»
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: TaskRecord;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
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
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl border p-3 shadow-sm transition group cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? "border-brand-300 opacity-40 ring-2 ring-brand-200"
          : "border-slate-200 hover:shadow"
      }`}
    >
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
        <GripVertical
          className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5"
          aria-hidden
        />
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
