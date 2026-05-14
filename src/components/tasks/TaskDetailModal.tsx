import { useState, useRef, useMemo } from "react";
import {
  X,
  Save,
  Trash2,
  Paperclip,
  Upload,
  MessageSquare,
  Send,
  Flame,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Field, Input, Textarea } from "../ui/Field";
import Select from "../ui/Select";
import {
  updateTask,
  addTaskComment,
  removeTaskComment,
  addAttachmentsToTask,
  removeAttachmentFromTask,
  isTaskOverdue,
  type TaskRecord,
  type TaskStatus,
} from "../../lib/taskStore";
import type { AttachmentRecord } from "../../lib/clientStore";
import { useUsers } from "../../lib/userStore";
import { useAuth } from "../../context/AuthContext";
import { uploadEntityFile, DriveNotConnectedError, DriveDisconnectedError } from "../../lib/drive";

const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "جديد" },
  { value: "doing", label: "قيد التنفيذ" },
  { value: "review", label: "قيد المراجعة" },
  { value: "done", label: "مكتملة" },
  { value: "cancelled", label: "ملغاة" },
];

type Props = {
  task: TaskRecord;
  onClose: () => void;
};

export default function TaskDetailModal({ task, onClose }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [startDate, setStartDate] = useState(task.startDate ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const overdue = useMemo(() => isTaskOverdue(task), [task]);

  const dirty =
    title !== task.title ||
    description !== task.description ||
    priority !== task.priority ||
    status !== task.status ||
    (startDate || null) !== task.startDate ||
    (dueDate || null) !== task.dueDate;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("أدخل عنوان المهمة");
      return;
    }
    if (startDate && dueDate && startDate > dueDate) {
      setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }
    setSaving(true);
    setError(null);
    const ok = await updateTask(task.id, {
      title,
      description,
      priority,
      status,
      startDate: startDate || null,
      dueDate: dueDate || null,
    });
    setSaving(false);
    if (ok) setSavedAt(Date.now());
    else setError("تعذّر الحفظ، حاول مرة أخرى");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                <Flame className="w-3 h-3" />
                متأخرة
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400" dir="ltr">
              {task.code}
            </span>
            <h2 className="text-lg font-extrabold text-slate-800">تفاصيل المهمة</h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <Field label="عنوان المهمة *">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="الوصف">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="حالة المهمة">
              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              />
            </Field>
            <Field label="الأولوية">
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="تاريخ البداية">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </Field>
            <Field label="تاريخ النهاية">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </Field>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            {savedAt && !dirty && (
              <span className="text-xs text-emerald-600 font-bold">تم الحفظ ✓</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
          </div>

          <AttachmentsSection task={task} />
          <CommentsSection task={task} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Attachments
// ============================================================

function AttachmentsSection({ task }: { task: TaskRecord }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handlePick = () => fileRef.current?.click();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const uploaded: AttachmentRecord[] = [];
    try {
      const folderName = `${task.title} (${task.code})`;
      for (const f of files) {
        const df = await uploadEntityFile("task", task.id, folderName, f, (l, t) => {
          setProgress(t > 0 ? Math.round((l / t) * 100) : 0);
        });
        uploaded.push({
          name: f.name,
          size: f.size,
          type: f.type,
          driveFileId: df.id,
          webViewLink: df.webViewLink,
          iconLink: df.iconLink,
          thumbnailLink: df.thumbnailLink,
          uploadedAt: new Date().toISOString(),
        });
      }
      if (uploaded.length > 0) await addAttachmentsToTask(task.id, uploaded);
    } catch (err) {
      if (err instanceof DriveNotConnectedError || err instanceof DriveDisconnectedError) {
        setError("Drive غير متصل. اربطه من صفحة الإدارة.");
      } else {
        setError(err instanceof Error ? err.message : "فشل رفع الملف");
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = async (index: number, name: string) => {
    if (!confirm(`إزالة المرفق "${name}"؟`)) return;
    await removeAttachmentFromTask(task.id, index);
  };

  return (
    <section className="pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePick}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? `جارٍ الرفع... ${progress}%` : "رفع ملف"}
        </button>
        <h3 className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          المرفقات ({task.attachments?.length ?? 0})
        </h3>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {error && (
        <div className="p-2 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 text-right">
          {error}
        </div>
      )}
      {(task.attachments?.length ?? 0) === 0 ? (
        <div className="text-center text-xs text-slate-400 py-4 border border-dashed border-slate-200 rounded-lg">
          لا توجد مرفقات
        </div>
      ) : (
        <ul className="space-y-1.5">
          {task.attachments.map((a, idx) => (
            <li
              key={`${a.name}-${idx}`}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(idx, a.name)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                  title="إزالة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {a.webViewLink && (
                  <a
                    href={a.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-sky-500 hover:bg-sky-50 rounded"
                    title="فتح في Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex-1 min-w-0 text-right flex items-center justify-end gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">{a.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {formatBytes(a.size)}
                  </div>
                </div>
                {a.thumbnailLink ? (
                  <img
                    src={a.thumbnailLink}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : a.iconLink ? (
                  <img src={a.iconLink} alt="" className="w-5 h-5" />
                ) : (
                  <Paperclip className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ============================================================
// Comments
// ============================================================

function CommentsSection({ task }: { task: TaskRecord }) {
  const { user } = useAuth();
  const { users } = useUsers();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const me = useMemo(
    () => users.find((u) => u.email && u.email === user?.email),
    [users, user]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    setSaving(true);
    const ok = await addTaskComment(task.id, {
      authorId: me?.id ?? user.id,
      authorName: me?.fullName || user.email || "مستخدم",
      text: trimmed,
    });
    setSaving(false);
    if (ok) setText("");
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("حذف التعليق؟")) return;
    await removeTaskComment(task.id, commentId);
  };

  const sorted = [...(task.comments ?? [])].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <section className="pt-4 border-t border-slate-100">
      <h3 className="text-sm font-extrabold text-slate-800 mb-3 inline-flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        التعليقات ({sorted.length})
      </h3>

      {sorted.length === 0 ? (
        <div className="text-center text-xs text-slate-400 py-4 border border-dashed border-slate-200 rounded-lg mb-3">
          لا توجد تعليقات
        </div>
      ) : (
        <ul className="space-y-2 mb-3">
          {sorted.map((c) => {
            const isMine = (me?.id ?? user?.id) === c.authorId;
            return (
              <li
                key={c.id}
                className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {(c.authorName?.[0] || "؟").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                      {isMine && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-0.5 hover:bg-rose-100 text-rose-500 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <Calendar className="w-3 h-3" />
                      <span dir="ltr">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {c.authorName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-6 whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600 disabled:opacity-50 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          {saving ? "..." : "إرسال"}
        </button>
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أضف تعليقاً..."
          className="flex-1"
        />
      </form>
    </section>
  );
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
