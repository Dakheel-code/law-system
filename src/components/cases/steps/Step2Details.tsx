import { useEffect, useState } from "react";
import { Plus, Trash2, Users as UsersIcon, Check, Edit3, X, User as UserIcon } from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState, CaseParty } from "../caseFormTypes";
import { useOffice } from "../../../lib/officeStore";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

const newParty = (): CaseParty => ({
  id: "p-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36),
  name: "",
  role: "defendant",
  idNumber: "",
  phone: "",
  address: "",
  lawyer: "",
  companyName: "",
  commercialRegistry: "",
  taxNumber: "",
});

export default function Step2Details({ data, update }: Props) {
  const { office } = useOffice();
  const caseTypes = office?.caseTypes ?? [];

  // Track which parties are in edit mode locally. A party is in edit mode if
  // it's brand-new (just added) or the user explicitly clicked "edit".
  const [editingIds, setEditingIds] = useState<Set<string>>(() => {
    // Start with any incomplete parties (no name) in edit mode
    return new Set(data.parties.filter((p) => !p.name.trim()).map((p) => p.id));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When parties change externally (e.g. on load), open any new empty ones.
  useEffect(() => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      for (const p of data.parties) {
        if (!p.name.trim() && !next.has(p.id)) next.add(p.id);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.parties.length]);

  const updateParty = (id: string, patch: Partial<CaseParty>) =>
    update(
      "parties",
      data.parties.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const addParty = () => {
    const p = newParty();
    update("parties", [...data.parties, p]);
    setEditingIds((s) => new Set(s).add(p.id));
  };

  const removeParty = (id: string) => {
    if (!confirm("هل تريد إزالة هذا الطرف؟")) return;
    update(
      "parties",
      data.parties.filter((p) => p.id !== id)
    );
    setEditingIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    setErrors((e) => {
      const { [id]: _omit, ...rest } = e;
      void _omit;
      return rest;
    });
  };

  const saveParty = (id: string) => {
    const party = data.parties.find((p) => p.id === id);
    if (!party) return;
    if (!party.name.trim()) {
      setErrors((e) => ({ ...e, [id]: "أدخل اسم الطرف على الأقل" }));
      return;
    }
    setErrors((e) => {
      const { [id]: _omit, ...rest } = e;
      void _omit;
      return rest;
    });
    setEditingIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  const editParty = (id: string) => {
    setEditingIds((s) => new Set(s).add(id));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="تفاصيل الطلب وأطراف القضية"
        subtitle="معلومات أطراف القضية ونوع القضية"
      />

      <div className="border-t border-dashed border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button
            type="button"
            onClick={addParty}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة طرف
          </button>
          <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-700">
            أطراف القضية{" "}
            <span className="text-slate-400 font-normal text-sm">
              ({data.parties.length})
            </span>
            <UsersIcon className="w-4 h-4 text-brand-500" />
          </h3>
        </div>

        {data.parties.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
            <UsersIcon
              className="w-10 h-10 text-slate-300 mx-auto mb-2"
              strokeWidth={1.4}
            />
            <p className="text-sm text-slate-500 mb-3">
              لم يتم إضافة أي طرف بعد
            </p>
            <button
              type="button"
              onClick={addParty}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
            >
              <Plus className="w-4 h-4" />
              إضافة الطرف الأول
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.parties.map((party, i) =>
              editingIds.has(party.id) ? (
                <PartyEditCard
                  key={party.id}
                  party={party}
                  index={i}
                  error={errors[party.id]}
                  onChange={(patch) => updateParty(party.id, patch)}
                  onSave={() => saveParty(party.id)}
                  onRemove={() => removeParty(party.id)}
                />
              ) : (
                <PartyCompact
                  key={party.id}
                  party={party}
                  onEdit={() => editParty(party.id)}
                  onRemove={() => removeParty(party.id)}
                />
              )
            )}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-700 text-right mb-4">
          تفاصيل القضية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="رقم القضية">
            <Input
              placeholder="رقم القضية الرسمي"
              value={data.caseNumber}
              onChange={(e) => update("caseNumber", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="نوع المطالبة">
            <Input
              placeholder="مثال: مطالبة بدين، تعويض، فسخ عقد..."
              value={data.claimSubject}
              onChange={(e) => update("claimSubject", e.target.value)}
            />
          </Field>

          <Field label="رقم الدائرة">
            <Input
              placeholder="مثال: 12"
              value={data.circuitName}
              onChange={(e) => update("circuitName", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="تصنيف القضية *">
            <Select
              options={caseTypes}
              value={data.caseType}
              onChange={(e) => update("caseType", e.target.value)}
              placeholder="اختر تصنيف القضية..."
            />
          </Field>

          <Field label="المحكمة">
            <Input
              placeholder="مثال: المحكمة العمالية بالرياض"
              value={data.courtType}
              onChange={(e) => update("courtType", e.target.value)}
            />
          </Field>
          <Field label="تاريخ القضية">
            <Input
              type="date"
              value={data.caseDate}
              onChange={(e) => update("caseDate", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>

          <Field label="تاريخ تكليف القضية">
            <Input
              type="date"
              value={data.assignmentDate}
              onChange={(e) => update("assignmentDate", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="عنوان القضية *">
            <Input
              placeholder="عنوان مختصر للقضية"
              value={data.requestTitle}
              onChange={(e) => update("requestTitle", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="وصف القضية">
            <Textarea
              placeholder="وصف تفصيلي للقضية..."
              rows={3}
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field label="موضوع الدعوى">
            <Textarea
              placeholder="موضوع الدعوى بتفصيل..."
              rows={3}
              value={data.lawsuitSubject}
              onChange={(e) => update("lawsuitSubject", e.target.value)}
            />
          </Field>
          <Field label="الطلبات">
            <Textarea
              placeholder="الطلبات المقدّمة للمحكمة..."
              rows={3}
              value={data.claims}
              onChange={(e) => update("claims", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Per-party — Edit mode card
// ============================================================

function PartyRoleButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "emerald" | "rose";
  onClick: () => void;
}) {
  const cls =
    color === "emerald"
      ? active
        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
      : active
      ? "bg-rose-50 border-rose-500 text-rose-700"
      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
  const ringCls =
    color === "emerald"
      ? active
        ? "border-emerald-500"
        : "border-slate-300"
      : active
      ? "border-rose-500"
      : "border-slate-300";
  const dotCls = color === "emerald" ? "bg-emerald-500" : "bg-rose-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition ${cls}`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${ringCls}`}
      >
        {active && <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />}
      </span>
      {label}
    </button>
  );
}

function PartyEditCard({
  party,
  index,
  error,
  onChange,
  onSave,
  onRemove,
}: {
  party: CaseParty;
  index: number;
  error?: string;
  onChange: (patch: Partial<CaseParty>) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-md text-xs font-bold shadow hover:bg-brand-600"
          >
            <Check className="w-3.5 h-3.5" />
            حفظ
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            إزالة
          </button>
        </div>
        <div className="flex items-center justify-start gap-2">
          <PartyRoleButton
            label="مدّعي"
            color="emerald"
            active={party.role === "plaintiff"}
            onClick={() => onChange({ role: "plaintiff" })}
          />
          <PartyRoleButton
            label="مدّعى عليه"
            color="rose"
            active={party.role === "defendant"}
            onClick={() => onChange({ role: "defendant" })}
          />
          <span className="text-xs font-bold text-slate-700 mr-2">
            الطرف {index + 1}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="الاسم *">
          <Input
            placeholder="اسم الطرف"
            value={party.name}
            onChange={(e) => onChange({ name: e.target.value })}
            autoFocus
          />
        </Field>
        <Field label="رقم الهوية">
          <Input
            placeholder="رقم الهوية"
            value={party.idNumber}
            onChange={(e) => onChange({ idNumber: e.target.value })}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="رقم الجوال">
          <Input
            placeholder="05xxxxxxxx"
            value={party.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="العنوان">
          <Input
            placeholder="العنوان"
            value={party.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </Field>
        <Field label="محامي الخصم">
          <Input
            placeholder="اسم المحامي المقابل"
            value={party.lawyer ?? ""}
            onChange={(e) => onChange({ lawyer: e.target.value })}
          />
        </Field>
      </div>

      {/* Company fields — collapsible under a divider, only relevant for institutions */}
      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
        <div className="text-xs font-bold text-slate-500 mb-2 text-right">
          بيانات الشركة / الجهة (إن وُجدت)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="اسم الشركة / الجهة">
            <Input
              placeholder="الاسم الكامل"
              value={party.companyName ?? ""}
              onChange={(e) => onChange({ companyName: e.target.value })}
            />
          </Field>
          <Field label="السجل التجاري">
            <Input
              placeholder="رقم السجل"
              value={party.commercialRegistry ?? ""}
              onChange={(e) =>
                onChange({ commercialRegistry: e.target.value })
              }
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="الرقم الضريبي">
            <Input
              placeholder="الرقم الضريبي"
              value={party.taxNumber ?? ""}
              onChange={(e) => onChange({ taxNumber: e.target.value })}
              dir="ltr"
              className="text-left"
            />
          </Field>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-rose-700 text-right">{error}</div>
      )}
    </div>
  );
}

function PartyCompact({
  party,
  onEdit,
  onRemove,
}: {
  party: CaseParty;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const isPlaintiff = party.role === "plaintiff";
  const wrapperCls = isPlaintiff
    ? "border-emerald-200 bg-emerald-50/40"
    : "border-rose-200 bg-rose-50/40";
  const avatarCls = isPlaintiff
    ? "bg-emerald-100 text-emerald-700"
    : "bg-rose-100 text-rose-700";
  const nameCls = isPlaintiff ? "text-emerald-800" : "text-rose-800";
  const roleLabel = isPlaintiff ? "مدّعي" : "مدّعى عليه";
  const roleChipCls = isPlaintiff
    ? "bg-emerald-500 text-white"
    : "bg-rose-500 text-white";

  const meta =
    [party.phone, party.idNumber, party.address]
      .filter((s) => s && s.trim())
      .join(" · ");

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${wrapperCls}`}
    >
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onRemove}
          title="إزالة"
          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="تعديل"
          className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${roleChipCls}`}
      >
        {roleLabel}
      </span>

      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-start gap-2">
          <div className={`text-sm font-bold truncate ${nameCls}`}>
            {party.name}
          </div>
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        </div>
        {meta && (
          <div className="text-[11px] text-slate-500 mt-0.5 truncate" dir="ltr">
            {meta}
          </div>
        )}
      </div>

      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${avatarCls}`}
      >
        <UserIcon className="w-4 h-4" />
      </div>
    </div>
  );
}
