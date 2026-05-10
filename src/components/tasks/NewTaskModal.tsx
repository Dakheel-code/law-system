import { useState } from "react";
import { X, Save } from "lucide-react";
import { Field, Input, Textarea } from "../ui/Field";
import Select from "../ui/Select";
import { addTask, type TaskStatus } from "../../lib/taskStore";

const statusOptions = [
  { value: "todo", label: "للقيام بها" },
  { value: "doing", label: "قيد التنفيذ" },
  { value: "review", label: "قيد المراجعة" },
  { value: "done", label: "مكتملة" },
];

const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

type Props = {
  onClose: () => void;
};

export default function NewTaskModal({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("أدخل عنوان المهمة");
      return;
    }
    setSaving(true);
    const created = await addTask({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
    });
    setSaving(false);
    if (created) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-800">مهمة جديدة</h2>
          </div>

          <div className="px-5 space-y-4">
            <Field label="عنوان المهمة *">
              <Input
                placeholder="مثال: إعداد مذكرة دفاع"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="الوصف">
              <Textarea
                placeholder="تفاصيل المهمة..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="الحالة">
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

            <Field label="تاريخ الاستحقاق">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </Field>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "جارٍ الحفظ..." : "إنشاء المهمة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
