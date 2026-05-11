import { HardDrive, Info } from "lucide-react";
import { Field, Textarea } from "../../ui/Field";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step6Attachments({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="الملاحظات النهائية"
        subtitle="أضف أي ملاحظات قبل إتمام الطلب — يمكنك رفع المرفقات بعد الحفظ"
      />

      <div className="rounded-xl bg-brand-50/50 border border-brand-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="text-right flex-1">
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              المرفقات تُرفع بعد إنشاء القضية
            </h4>
            <p className="text-xs text-slate-600 leading-6">
              بعد حفظ هذه الخطوة، ستُنشأ القضية ويتم توجيهك إلى صفحة تفاصيلها.
              من هناك يمكنك رفع الملفات وستُخزَّن تلقائياً في مجلد القضية على
              Google Drive.
            </p>
            <p className="text-[11px] text-brand-700 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              المجلد:{" "}
              <span className="font-mono" dir="ltr">
                ناصر طريد / قضايا / &lt;رقم القضية&gt;
              </span>
            </p>
          </div>
        </div>
      </div>

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
