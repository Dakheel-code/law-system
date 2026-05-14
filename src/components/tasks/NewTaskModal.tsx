import { useMemo, useState } from "react";
import {
  X,
  Save,
  Users as UsersIcon,
  Check,
  Search,
  Info,
  Briefcase,
} from "lucide-react";
import { Field, Input, Textarea } from "../ui/Field";
import Select from "../ui/Select";
import { addTask } from "../../lib/taskStore";
import { useUsers } from "../../lib/userStore";
import { useCases, type CaseRecord } from "../../lib/caseStore";

const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

type Props = {
  onClose: () => void;
  /** Pre-link the new task to a case (e.g. when opened from CaseDetail). */
  initialCaseId?: string;
  /** Pre-link the new task to a client (e.g. when opened from ClientProfile). */
  initialClientId?: string;
};

export default function NewTaskModal({ onClose, initialCaseId, initialClientId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [caseId, setCaseId] = useState<string>(initialCaseId ?? "");
  const [clientId, setClientId] = useState<string | null>(initialClientId ?? null);
  const caseLocked = Boolean(initialCaseId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("أدخل عنوان المهمة");
      return;
    }
    if (startDate && dueDate && startDate > dueDate) {
      setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }
    setSaving(true);
    // New tasks always start in "جديد" status (the default in addTask).
    const created = await addTask({
      title,
      description,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignees,
      caseId: caseId || null,
      clientId: clientId ?? null,
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
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
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

            <Field label="الأولوية">
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </Field>

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

            <CasePicker
              value={caseId}
              onChange={(id, clId) => {
                setCaseId(id);
                if (clId !== undefined) setClientId(clId);
              }}
              locked={caseLocked}
            />

            <AssigneesPicker value={assignees} onChange={setAssignees} />

            <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-700 text-right">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                المرفقات والتعليقات تُضاف بعد إنشاء المهمة. اضغط على بطاقة المهمة في لوحة Kanban لفتح التفاصيل وإدارة المرفقات والتعليقات.
              </span>
            </div>

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

// ============================================================
// Multi-select assignees with chips + searchable list
// ============================================================

function AssigneesPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { users, loading } = useUsers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const active = users.filter((u) => u.status === "active");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return active;
    return active.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [active, search]);

  const selectedUsers = users.filter((u) => value.includes(u.id));

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };
  const remove = (id: string) => onChange(value.filter((x) => x !== id));

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        المكلَّفون بالمهمة
      </label>

      {/* Selected chips */}
      <div className="min-h-[42px] w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-2">
        {selectedUsers.length === 0 ? (
          <span className="text-xs text-slate-400">لم يتم اختيار أي مستخدم</span>
        ) : (
          selectedUsers.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-100 text-brand-700 rounded-md text-xs font-bold"
            >
              <button
                type="button"
                onClick={() => remove(u.id)}
                className="p-0.5 hover:bg-brand-200 rounded"
                aria-label={`إزالة ${u.fullName}`}
              >
                <X className="w-3 h-3" />
              </button>
              {u.fullName || u.code}
            </span>
          ))
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mr-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded"
        >
          <UsersIcon className="w-3.5 h-3.5" />
          {open ? "إخفاء" : selectedUsers.length > 0 ? "تعديل" : "إضافة"}
        </button>
      </div>

      {/* Picker */}
      {open && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم..."
              className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-6">
                جارٍ التحميل...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                لا يوجد مستخدمون مطابقون
              </div>
            ) : (
              filtered.map((u) => {
                const sel = value.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggle(u.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${
                      sel ? "bg-brand-50/60" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        sel
                          ? "bg-brand-500 border-brand-500"
                          : "border-slate-300"
                      }`}
                    >
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {u.avatarDataUrl ? (
                      <img
                        src={u.avatarDataUrl}
                        alt={u.fullName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                        {(u.firstName?.[0] || u.fullName?.[0] || "؟").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm font-bold text-slate-700 truncate">
                        {u.fullName || u.code}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {u.type || u.email || u.code}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {value.length} مختار من <bdi dir="ltr">{active.length}</bdi>
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={value.length === 0}
              className="text-rose-500 hover:text-rose-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              مسح الكل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Case picker — searchable selector for linking a task to a case
// ============================================================

function CasePicker({
  value,
  onChange,
  locked,
}: {
  value: string;
  /**
   * onChange receives the case id, and OPTIONALLY the clientId that should
   * be auto-attached (when picking a case). Pass `clientId === undefined`
   * to leave clientId untouched.
   */
  onChange: (caseId: string, clientId?: string | null) => void;
  locked: boolean;
}) {
  const { cases } = useCases();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === value) ?? null,
    [cases, value]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? cases.slice(0, 12)
      : cases.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            (c.caseNumber ?? "").toLowerCase().includes(q) ||
            (c.requestTitle ?? "").toLowerCase().includes(q) ||
            (c.description ?? "").toLowerCase().includes(q)
        );
    return list.slice(0, 12);
  }, [cases, search]);

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        ربط بقضية (اختياري)
      </label>

      {selectedCase && !open ? (
        <SelectedCaseChip
          caseItem={selectedCase}
          locked={locked}
          onClear={() => {
            onChange("", null);
            setOpen(true);
          }}
        />
      ) : (
        <div className="space-y-2">
          {value && (
            // The selected id no longer points to a known case (e.g. cases
            // still loading). Show a subtle hint plus a clear button.
            <div className="text-[11px] text-slate-400 text-right">
              جارٍ تحميل القضية المختارة...
            </div>
          )}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بكود/رقم/عنوان القضية..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            {filtered.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                {cases.length === 0
                  ? "لا توجد قضايا بعد"
                  : "لا توجد قضايا مطابقة"}
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    onChange(c.id, c.clientId);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-right hover:bg-brand-50/40 border-b border-slate-100 last:border-b-0 transition"
                >
                  <Briefcase className="w-4 h-4 text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-sm font-bold text-slate-700 truncate">
                      {c.requestTitle || c.code}
                    </div>
                    <div
                      className="text-[10px] text-slate-500 font-mono mt-0.5"
                      dir="ltr"
                    >
                      {c.caseNumber
                        ? `${c.caseNumber} · ${c.code}`
                        : c.code}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedCaseChip({
  caseItem,
  locked,
  onClear,
}: {
  caseItem: CaseRecord;
  locked: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
      {!locked && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-md hover:bg-emerald-100 text-emerald-700"
          title="إزالة الربط"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <Briefcase className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-sm font-bold text-emerald-800 flex items-center justify-start gap-1.5">
          <Check className="w-3.5 h-3.5" />
          {caseItem.requestTitle || caseItem.code}
        </div>
        <div className="text-[11px] text-emerald-700/80 mt-0.5 font-mono" dir="ltr">
          {caseItem.caseNumber
            ? `${caseItem.caseNumber} · ${caseItem.code}`
            : caseItem.code}
        </div>
      </div>
    </div>
  );
}
