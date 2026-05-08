import { useRef, useState } from "react";

type Props = {
  label: string;
  accept?: string;
  maxMB?: number;
  hint?: string;
};

export default function FileUpload({
  label,
  accept = "image/jpeg,image/png,image/gif,image/webp,image/avif",
  maxMB = 2,
  hint = "الحد الأقصى 2 ميجابايت. الصيغ المدعومة: JPG, PNG, GIF, WebP, AVIF",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("لم يتم اختيار أي ملف");

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        {label}
      </label>
      <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="px-4 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50"
        >
          اختيار ملف
        </button>
        <span className="text-sm text-slate-400 flex-1 text-right">{name}</span>
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > maxMB * 1024 * 1024) {
              alert(`حجم الملف يتجاوز ${maxMB} ميجابايت`);
              return;
            }
            setName(file.name);
          }}
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1.5 text-right">{hint}</p>
    </div>
  );
}
