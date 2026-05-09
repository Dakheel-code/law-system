import { useRef } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  maxMB?: number;
};

export default function LogoUpload({ value, onChange, maxMB = 2 }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`الحد الأقصى ${maxMB} ميجابايت`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg"
        className="hidden"
        onChange={onFileChange}
      />

      {value ? (
        <div className="rounded-xl border-2 border-slate-200 p-5 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
            >
              <Upload className="w-4 h-4" />
              تغيير
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <img
              src={value}
              alt="logo"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition"
        >
          <ImageIcon className="w-10 h-10 mb-2" strokeWidth={1.4} />
          <span className="text-sm font-bold">اضغط لرفع الشعار</span>
          <span className="text-xs mt-1">
            PNG, SVG, JPG — حتى {maxMB}MB
          </span>
        </button>
      )}
    </div>
  );
}
