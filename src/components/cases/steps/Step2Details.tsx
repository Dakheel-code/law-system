import { Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState, CaseParty } from "../caseFormTypes";
import { urgencyLevels } from "../../../config/caseConfig";
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
});

export default function Step2Details({ data, update }: Props) {
  const { office } = useOffice();
  const caseTypes = office?.caseTypes ?? [];
  const courtTypes = office?.courtTypes ?? [];

  const updateParty = (id: string, patch: Partial<CaseParty>) =>
    update(
      "parties",
      data.parties.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const addParty = () => update("parties", [...data.parties, newParty()]);
  const removeParty = (id: string) =>
    update(
      "parties",
      data.parties.filter((p) => p.id !== id)
    );

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
          <div className="space-y-4">
            {data.parties.map((party, i) => (
              <div
                key={party.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => removeParty(party.id)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    إزالة
                  </button>
                  <div className="flex items-center justify-start gap-2">
                    <RoleButton
                      label="مدّعي"
                      active={party.role === "plaintiff"}
                      onClick={() => updateParty(party.id, { role: "plaintiff" })}
                    />
                    <RoleButton
                      label="مدّعى عليه"
                      active={party.role === "defendant"}
                      onClick={() => updateParty(party.id, { role: "defendant" })}
                    />
                    <span className="text-xs font-bold text-slate-700 mr-2">
                      الطرف {i + 1}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="الاسم">
                    <Input
                      placeholder="اسم الطرف"
                      value={party.name}
                      onChange={(e) => updateParty(party.id, { name: e.target.value })}
                    />
                  </Field>
                  <Field label="رقم الهوية">
                    <Input
                      placeholder="رقم الهوية"
                      value={party.idNumber}
                      onChange={(e) =>
                        updateParty(party.id, { idNumber: e.target.value })
                      }
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                  <Field label="رقم الجوال">
                    <Input
                      placeholder="05xxxxxxxx"
                      value={party.phone}
                      onChange={(e) =>
                        updateParty(party.id, { phone: e.target.value })
                      }
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                  <Field label="العنوان">
                    <Input
                      placeholder="العنوان"
                      value={party.address}
                      onChange={(e) =>
                        updateParty(party.id, { address: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </div>
            ))}
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

          <Field label="اسم الدائرة">
            <Input
              placeholder="مثال: الدائرة التجارية الأولى"
              value={data.circuitName}
              onChange={(e) => update("circuitName", e.target.value)}
            />
          </Field>
          <Field label="نوع القضية *">
            <Select
              options={caseTypes}
              value={data.caseType}
              onChange={(e) => update("caseType", e.target.value)}
              placeholder="اختر نوع القضية..."
            />
          </Field>

          <Field label="نوع المحكمة">
            <Select
              options={courtTypes}
              value={data.courtType}
              onChange={(e) => update("courtType", e.target.value)}
              placeholder="اختر نوع المحكمة..."
            />
          </Field>
          <Field label="درجة الاستعجال *">
            <Select
              options={urgencyLevels}
              value={data.urgency}
              onChange={(e) => update("urgency", e.target.value)}
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
          <Field label="تاريخ القضية">
            <Input
              type="date"
              value={data.caseDate}
              onChange={(e) => update("caseDate", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>

          <Field label="عنوان الطلب *">
            <Input
              placeholder="عنوان مختصر للطلب"
              value={data.requestTitle}
              onChange={(e) => update("requestTitle", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="وصف الطلب">
            <Textarea
              placeholder="وصف تفصيلي للقضية والطلب..."
              rows={4}
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function RoleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-bold transition ${
        active
          ? "bg-rose-50 border-rose-500 text-rose-700"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          active ? "border-rose-500" : "border-slate-300"
        }`}
      >
        {active && <span className="w-2 h-2 rounded-full bg-rose-500" />}
      </span>
      {label}
    </button>
  );
}
