import { useMemo, useState } from "react";
import { Field, Input } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { priorities } from "../../../config/caseConfig";
import { useUsers } from "../../../lib/userStore";
import { Users as UsersIcon, X, Check, Search } from "lucide-react";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step5Duration({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="المدة والإدارة"
        subtitle="الأولوية والمحامون المعيّنون والمدّة"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="الأولوية *">
          <Select
            options={priorities}
            value={data.priority}
            onChange={(e) => update("priority", e.target.value)}
          />
        </Field>

        <Field label="تاريخ البدء">
          <Input
            type="date"
            value={data.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>

        <Field label="التاريخ المتوقع للانتهاء">
          <Input
            type="date"
            value={data.expectedEndDate}
            onChange={(e) => update("expectedEndDate", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>

        <Field label="العقد المرتبط">
          <Input
            placeholder="رقم/اسم العقد (اختياري)"
            value={data.linkedContract}
            onChange={(e) => update("linkedContract", e.target.value)}
          />
        </Field>
      </div>

      <LawyersPicker
        value={data.assignedLawyers}
        onChange={(v) => {
          update("assignedLawyers", v);
          // keep primary lawyer in sync
          update("assignedLawyer", v[0] ?? "");
        }}
      />
    </div>
  );
}

// ============================================================
// Multi-lawyer picker
// ============================================================

function LawyersPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { users, loading } = useUsers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const active = users.filter(
    (u) =>
      u.status === "active" &&
      (u.type === "lawyer" || u.type === "manager" || u.type === "supervisor")
  );

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
        المحامون المعيَّنون
      </label>
      <div className="min-h-[42px] w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-2">
        {selectedUsers.length === 0 ? (
          <span className="text-xs text-slate-400">لم يتم تعيين أي محامي</span>
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
                لا يوجد محامون مطابقون
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
