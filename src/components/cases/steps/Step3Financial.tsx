import { Field } from "../../ui/Field";
import Select from "../../ui/Select";
import MoneyInput from "../../ui/MoneyInput";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { claimTypes, paymentMethods, paymentStatus } from "../../../config/caseConfig";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step3Financial({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="المالية والمطالبة"
        subtitle="نوع المطالبة والمبالغ وحالة الدفع"
      />

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
          نوع المطالبة
        </label>
        <div className="flex items-center justify-end gap-4">
          {claimTypes.map((c) => {
            const checked = data.claimType === c.value;
            return (
              <label key={c.value} className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-slate-600">{c.label}</span>
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    checked ? "border-brand-500" : "border-slate-300"
                  }`}
                >
                  {checked && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                </span>
                <input
                  type="radio"
                  name="claimType"
                  className="hidden"
                  checked={checked}
                  onChange={() => update("claimType", c.value)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="التكلفة المقدرة للأتعاب">
          <MoneyInput
            value={data.estimatedFees || ""}
            onChange={(e) => update("estimatedFees", parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="رسوم الاستشارة الأولية">
          <MoneyInput
            value={data.consultationFees || ""}
            onChange={(e) => update("consultationFees", parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="الرسوم القضائية المتوقعة">
          <MoneyInput
            value={data.expectedCourtFees || ""}
            onChange={(e) => update("expectedCourtFees", parseFloat(e.target.value) || 0)}
          />
        </Field>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="حالة الدفع *">
          <Select
            options={paymentStatus}
            value={data.paymentStatus}
            onChange={(e) => update("paymentStatus", e.target.value)}
          />
        </Field>
        <Field label="طريقة الدفع">
          <Select
            options={paymentMethods}
            value={data.paymentMethod}
            onChange={(e) => update("paymentMethod", e.target.value)}
            placeholder="اختر طريقة الدفع..."
          />
        </Field>
      </div>
    </div>
  );
}
