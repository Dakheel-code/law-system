import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { caseTypes, courtTypes, urgencyLevels } from "../../../config/caseConfig";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step2Details({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="تفاصيل الطلب والطرف الآخر"
        subtitle="معلومات الطرف المقابل ونوع القضية"
      />

      <div className="border-t border-dashed border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-700 text-right mb-4">
          الطرف الآخر <span className="text-slate-400 font-normal text-sm">(اختياري)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم الطرف الآخر">
            <Input
              placeholder="اسم الخصم"
              value={data.otherPartyName}
              onChange={(e) => update("otherPartyName", e.target.value)}
            />
          </Field>
          <Field label="رقم هوية الطرف الآخر">
            <Input
              placeholder="رقم الهوية"
              value={data.otherPartyId}
              onChange={(e) => update("otherPartyId", e.target.value)}
            />
          </Field>
          <Field label="رقم جوال الطرف الآخر">
            <Input
              placeholder="رقم الجوال"
              value={data.otherPartyPhone}
              onChange={(e) => update("otherPartyPhone", e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="عنوان الطرف الآخر">
            <Input
              placeholder="العنوان"
              value={data.otherPartyAddress}
              onChange={(e) => update("otherPartyAddress", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-700 text-right mb-4">
          تفاصيل القضية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Field label="عنوان الطلب *">
            <Input
              placeholder="عنوان مختصر للطلب"
              value={data.requestTitle}
              onChange={(e) => update("requestTitle", e.target.value)}
            />
          </Field>
          <Field label="درجة الاستعجال *">
            <Select
              options={urgencyLevels}
              value={data.urgency}
              onChange={(e) => update("urgency", e.target.value)}
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
