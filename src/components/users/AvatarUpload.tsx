import { useRef, useState } from "react";
import { Pencil, User } from "lucide-react";

export default function AvatarUpload() {
  const ref = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
          {src ? (
            <img src={src} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-14 h-14 text-slate-300" strokeWidth={1.4} />
          )}
        </div>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow hover:bg-brand-600"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 2 * 1024 * 1024) return alert("الحد الأقصى 2 ميجابايت");
            setSrc(URL.createObjectURL(f));
          }}
        />
      </div>
      <p className="text-xs text-slate-400">
        الأنواع المسموحة: png, jpg, jpeg. الحد الأقصى: 2 ميجابايت
      </p>
    </div>
  );
}
