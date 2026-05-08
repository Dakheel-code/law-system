import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { Field, Textarea } from "../../ui/Field";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step6Attachments({ data, update }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((p) => [...p, ...Array.from(list)]);
  };

  const remove = (i: number) => setFiles((p) => p.filter((_, j) => j !== i));

  return (
    <div className="space-y-6">
      <StepHeader
        title="المرفقات والملاحظات"
        subtitle="ارفع الوثائق المتعلقة بالطلب وأكمل الإنشاء"
      />

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
          المرفقات
        </label>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-10 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition"
        >
          <UploadCloud className="w-10 h-10 mb-3" strokeWidth={1.4} />
          <span className="text-sm font-bold">اضغط لرفع الملفات أو اسحبها هنا</span>
          <span className="text-xs mt-1">PDF, DOCX, JPG, PNG — حتى 10MB لكل ملف</span>
        </button>
        <input
          ref={ref}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-700">{f.name}</span>
                  <span className="text-xs text-slate-400">
                    ({(f.size / 1024).toFixed(1)} KB)
                  </span>
                  <FileText className="w-4 h-4 text-brand-500" />
                </div>
              </li>
            ))}
          </ul>
        )}
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
