import { Field, Textarea } from "../../ui/Field";
import StepHeader from "../StepHeader";
import AttachmentsUpload from "../../ui/AttachmentsUpload";
import type { CaseFormState } from "../caseFormTypes";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step6Attachments({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="المرفقات والملاحظات"
        subtitle="ارفع الوثائق المتعلقة بالطلب وأكمل الإنشاء"
      />

      <AttachmentsUpload
        label="المرفقات"
        value={data.attachments}
        onChange={(v) => update("attachments", v)}
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx"
        maxMB={10}
        hint="PDF, DOCX, JPG, PNG, GIF — حتى 10MB لكل ملف"
      />

      <Field label="ملاحظات نهائية">
        <Textarea
          placeholder="أي ملاحظات أخيرة قبل إتمام الطلب..."
          rows={5}
          value={data.finalNotes}
          onChange={(e) => update("finalNotes", e.target.value)}
        />
      </Field>
    </div>
  );
}
