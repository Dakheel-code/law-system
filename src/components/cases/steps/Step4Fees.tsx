import { Plus, Trash2 } from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import MoneyInput from "../../ui/MoneyInput";
import StepHeader from "../StepHeader";
import type { CaseFormState, FeeItem } from "../caseFormTypes";
import { feeTypes } from "../../../config/caseConfig";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step4Fees({ data, update }: Props) {
  const setFees = (fees: FeeItem[]) => update("fees", fees);

  const updateFee = (id: string, patch: Partial<FeeItem>) =>
    setFees(data.fees.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addFee = () =>
    setFees([
      ...data.fees,
      { id: crypto.randomUUID(), description: "", type: "fixed", amount: 0 },
    ]);

  const removeFee = (id: string) =>
    setFees(data.fees.length > 1 ? data.fees.filter((f) => f.id !== id) : data.fees);

  return (
    <div className="space-y-6">
      <StepHeader
        title="أتعاب المحاماة"
        subtitle="أضف عناصر الأتعاب المتفق عليها"
      />

      <div className="space-y-4">
        {data.fees.map((fee, i) => (
          <div key={fee.id} className="rounded-xl border border-slate-200 p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              {data.fees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFee(fee.id)}
                  className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-sm font-bold text-slate-700">عنصر أتعاب #{i + 1}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="وصف الأتعاب">
                <Input
                  placeholder="مثال: أتعاب أساسية، أتعاب استئناف..."
                  value={fee.description}
                  onChange={(e) => updateFee(fee.id, { description: e.target.value })}
                />
              </Field>
              <Field label="نوع الأتعاب">
                <Select
                  options={feeTypes}
                  value={fee.type}
                  onChange={(e) => updateFee(fee.id, { type: e.target.value })}
                />
              </Field>
              <Field label="المبلغ">
                <MoneyInput
                  value={fee.amount || ""}
                  onChange={(e) =>
                    updateFee(fee.id, { amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addFee}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
        >
          <Plus className="w-4 h-4" />
          إضافة عنصر أتعاب
        </button>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5">
        <Field label="ملاحظات عامة عن الأتعاب">
          <Textarea
            placeholder="أي ملاحظات إضافية حول الأتعاب المتفق عليها..."
            rows={4}
            value={data.feesNotes}
            onChange={(e) => update("feesNotes", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
