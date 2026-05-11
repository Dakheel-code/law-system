import { Field, Input } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { priorities } from "../../../config/caseConfig";
import { useUsers } from "../../../lib/userStore";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step5Duration({ data, update }: Props) {
  const { users } = useUsers();
  const lawyerOptions = [
    { value: "", label: "اختر محامياً..." },
    ...users
      .filter((u) => u.status === "active" && (u.type === "lawyer" || u.type === "manager"))
      .map((u) => ({ value: u.id, label: u.fullName || u.code })),
  ];

  return (
    <div className="space-y-6">
      <StepHeader
        title="المدة والإدارة"
        subtitle="الأولوية والعقود وتعيين المحامي"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="الأولوية *">
          <Select
            options={priorities}
            value={data.priority}
            onChange={(e) => update("priority", e.target.value)}
          />
        </Field>

        <Field label="المحامي المسند">
          <Select
            options={lawyerOptions}
            value={data.assignedLawyer}
            onChange={(e) => update("assignedLawyer", e.target.value)}
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
    </div>
  );
}
