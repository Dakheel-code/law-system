import { Field, Input } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { priorities } from "../../../config/caseConfig";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step5Duration({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="المدة والإدارة"
        subtitle="الأولوية والمواعيد والعقد المرتبط"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="الأولوية *">
          <Select
            options={priorities}
            value={data.priority}
            onChange={(e) => update("priority", e.target.value)}
          />
        </Field>

        <Field label="العقد المرتبط">
          <Input
            placeholder="رقم/اسم العقد (اختياري)"
            value={data.linkedContract}
            onChange={(e) => update("linkedContract", e.target.value)}
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
      </div>
    </div>
  );
}
