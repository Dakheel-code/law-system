import { useRef } from "react";
import { UploadCloud, FileText, X, Image as ImageIcon, FileType } from "lucide-react";
import type { AttachmentRecord } from "../../lib/clientStore";

type Props = {
  label?: string;
  value: AttachmentRecord[];
  onChange: (files: AttachmentRecord[]) => void;
  accept?: string;
  maxMB?: number;
  hint?: string;
};

export default function AttachmentsUpload({
  label = "المرفقات",
  value,
  onChange,
  accept = "image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx",
  maxMB = 5,
  hint = "PDF, DOCX, JPG, PNG, GIF, WebP — حتى 5MB لكل ملف",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const accepted: AttachmentRecord[] = [];
    for (const file of arr) {
      if (file.size > maxMB * 1024 * 1024) {
        alert(`${file.name} — حجمه يتجاوز ${maxMB} ميجابايت`);
        continue;
      }
      const dataUrl = await readAsDataURL(file);
      accepted.push({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
      });
    }
    onChange([...value, ...accepted]);
  };

  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        {label}
      </label>

      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition"
      >
        <UploadCloud className="w-10 h-10 mb-2" strokeWidth={1.4} />
        <span className="text-sm font-bold">اضغط لرفع المرفقات (يمكنك اختيار عدة ملفات)</span>
        <span className="text-xs mt-1">{hint}</span>
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <button
                type="button"
                onClick={() => remove(i)}
                title="حذف"
                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-right min-w-0">
                  <div className="text-sm text-slate-700 truncate" title={f.name}>
                    {f.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatSize(f.size)}
                  </div>
                </div>
                <FileBadge type={f.type} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FileBadge({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return (
      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-4 h-4 text-violet-600" />
      </div>
    );
  }
  if (type === "application/pdf") {
    return (
      <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-4 h-4 text-brand-600" />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
