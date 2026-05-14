// CaseTasksPanel — list of tasks linked to a single case.
//
// Filters the global tasks list by caseId, groups by status, and exposes
// a "New task" action that opens NewTaskModal pre-linked to the case.

import { useMemo, useState } from "react";
import {
  Plus,
  Calendar,
  Flame,
  Paperclip,
  MessageSquare,
  Inbox,
  CheckCircle2,
  Circle,
  AlertOctagon,
  Clock,
  XCircle,
} from "lucide-react";
import {
  useTasks,
  isTaskOverdue,
  type TaskRecord,
  type TaskStatus,
} from "../../lib/taskStore";
import { useUsers, type UserRecord } from "../../lib/userStore";
import NewTaskModal from "../tasks/NewTaskModal";
import TaskDetailModal from "../tasks/TaskDetailModal";

const statusMeta: Record<
  TaskStatus,
  {
    label: string;
    tone: string;       // chip background + text
    accent: string;     // left edge bar color
    icon: typeof Circle;
  }
> = {
  todo: {
    label: "للقيام بها",
    tone: "bg-slate-100 text-slate-700",
    accent: "bg-slate-300",
    icon: Circle,
  },
  doing: {
    label: "قيد التنفيذ",
    tone: "bg-sky-100 text-sky-700",
    accent: "bg-sky-500",
    icon: Clock,
  },
  review: {
    label: "قيد المراجعة",
    tone: "bg-amber-100 text-amber-700",
    accent: "bg-amber-500",
    icon: AlertOctagon,
  },
  done: {
    label: "مكتملة",
    tone: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "ملغاة",
    tone: "bg-slate-200 text-slate-600",
    accent: "bg-slate-400",
    icon: XCircle,
  },
};

const priorityChip: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};
const priorityLabel: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
  });
};

type Props = {
  caseId: string;
  clientId: string | null;
};

export default function CaseTasksPanel({ caseId, clientId }: Props) {
  const { tasks, loading } = useTasks();
  const { users } = useUsers();
  const [creating, setCreating] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  const caseTasks = useMemo(
    () => tasks.filter((t) => t.caseId === caseId && !t.archived),
    [tasks, caseId]
  );

  const openTask = openTaskId
    ? caseTasks.find((t) => t.id === openTaskId) ?? null
    : null;

  const statusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      doing: 0,
      review: 0,
      done: 0,
      cancelled: 0,
    };
    caseTasks.forEach((t) => {
      counts[t.status]++;
    });
    return counts;
  }, [caseTasks]);

  const overdueCount = useMemo(
    () => caseTasks.filter((t) => isTaskOverdue(t)).length,
    [caseTasks]
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          مهمة جديدة
        </button>
        <div className="flex items-center justify-end gap-2 flex-wrap text-xs">
          {overdueCount > 0 && (
            <Chip
              icon={Flame}
              label="متأخرة"
              count={overdueCount}
              cls="bg-rose-50 text-rose-700 border-rose-200"
            />
          )}
          {(["todo", "doing", "review", "done", "cancelled"] as TaskStatus[])
            .filter((s) => statusCounts[s] > 0)
            .map((s) => (
              <Chip
                key={s}
                icon={statusMeta[s].icon}
                label={statusMeta[s].label}
                count={statusCounts[s]}
                cls={statusMeta[s].tone + " border-transparent"}
              />
            ))}
        </div>
      </div>

      {loading && caseTasks.length === 0 ? (
        <div className="text-center text-sm text-slate-400 py-8">جارٍ التحميل...</div>
      ) : caseTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
          <Inbox className="w-12 h-12 mb-2" strokeWidth={1.2} />
          <p className="text-sm font-bold mb-1">لا توجد مهام مرتبطة بهذه القضية</p>
          <p className="text-xs text-slate-400 mb-4">
            أضف مهمة لتتبّع الإجراءات والمواعيد
          </p>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
          >
            <Plus className="w-4 h-4" />
            إضافة المهمة الأولى
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {caseTasks
            .slice()
            .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
            .map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                assignees={(t.assignees ?? [])
                  .map((id) => userById.get(id))
                  .filter((u): u is UserRecord => !!u)}
                onOpen={() => setOpenTaskId(t.id)}
              />
            ))}
        </ul>
      )}

      {creating && (
        <NewTaskModal
          onClose={() => setCreating(false)}
          initialCaseId={caseId}
          initialClientId={clientId ?? undefined}
        />
      )}
      {openTask && (
        <TaskDetailModal task={openTask} onClose={() => setOpenTaskId(null)} />
      )}
    </>
  );
}

function Chip({
  icon: Icon,
  label,
  count,
  cls,
}: {
  icon: typeof Circle;
  label: string;
  count: number;
  cls: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border ${cls}`}
    >
      <Icon className="w-3 h-3" />
      {label}
      <span className="font-extrabold">{count}</span>
    </span>
  );
}

function TaskCard({
  task,
  assignees,
  onOpen,
}: {
  task: TaskRecord;
  assignees: UserRecord[];
  onOpen: () => void;
}) {
  const overdue = isTaskOverdue(task);
  const due = fmtDate(task.dueDate);
  const sm = statusMeta[task.status];
  const StatusIcon = sm.icon;
  const attachmentsCount = task.attachments?.length ?? 0;
  const commentsCount = task.comments?.length ?? 0;
  const isDone = task.status === "done";

  return (
    <li
      onClick={onOpen}
      className={`relative overflow-hidden bg-white rounded-xl border shadow-sm transition cursor-pointer hover:shadow-md select-none flex flex-col ${
        overdue
          ? "border-rose-300 ring-1 ring-rose-100"
          : isDone
          ? "border-emerald-200"
          : "border-slate-200 hover:border-brand-300"
      }`}
    >
      {/* Status accent bar on the right edge (RTL = leading) */}
      <span
        aria-hidden
        className={`absolute top-0 right-0 bottom-0 w-1.5 ${
          overdue ? "bg-rose-500" : sm.accent
        }`}
      />

      <div className="p-3.5 pr-4 flex-1 flex flex-col">
        {/* Header: status chip + code */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="text-[9px] font-mono text-slate-400 tracking-tight"
            dir="ltr"
          >
            {task.code}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${sm.tone}`}
          >
            <StatusIcon className="w-3 h-3" />
            {sm.label}
          </span>
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-extrabold text-right leading-6 line-clamp-2 mb-1 ${
            isDone
              ? "text-slate-500 line-through decoration-emerald-400"
              : "text-slate-800"
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 leading-5 line-clamp-2 text-right mb-2.5">
            {task.description}
          </p>
        )}

        {/* Overdue banner */}
        {overdue && (
          <div className="inline-flex items-center gap-1 self-start px-2 py-0.5 mb-2.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
            <Flame className="w-3 h-3" />
            متأخرة
          </div>
        )}

        {/* Pills row — date + priority + counts */}
        <div className="flex items-center justify-end gap-1.5 flex-wrap mt-auto">
          {due && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                overdue
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-sky-50 text-sky-700 border border-sky-100"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {due}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              priorityChip[task.priority] ?? priorityChip.medium
            } ${
              task.priority === "urgent" ? "border-rose-200" : "border-transparent"
            }`}
          >
            {task.priority === "urgent" && <AlertOctagon className="w-3 h-3" />}
            {priorityLabel[task.priority] ?? task.priority}
          </span>
          {commentsCount > 0 && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-bold"
              title={`${commentsCount} تعليق`}
            >
              <MessageSquare className="w-3 h-3" />
              {commentsCount}
            </span>
          )}
          {attachmentsCount > 0 && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold"
              title={`${attachmentsCount} مرفق`}
            >
              <Paperclip className="w-3 h-3" />
              {attachmentsCount}
            </span>
          )}
        </div>
      </div>

      {/* Footer with assignees */}
      {assignees.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[10px] text-slate-500 font-bold">
            {assignees.length === 1 ? "المكلَّف" : `المكلَّفون (${assignees.length})`}
          </span>
          <div className="flex items-center -space-x-1.5 -space-x-reverse" dir="ltr">
            {assignees.slice(0, 4).map((u) => (
              <span
                key={u.id}
                title={u.fullName || u.code}
                className="w-7 h-7 rounded-full ring-2 ring-white overflow-hidden shrink-0"
              >
                {u.avatarDataUrl ? (
                  <img
                    src={u.avatarDataUrl}
                    alt={u.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center">
                    {(u.firstName?.[0] || u.fullName?.[0] || "؟").toUpperCase()}
                  </span>
              )}
            </span>
          ))}
            {assignees.length > 4 && (
              <span className="w-7 h-7 rounded-full ring-2 ring-white bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                +{assignees.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
