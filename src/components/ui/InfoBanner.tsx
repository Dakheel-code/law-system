import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  variant?: "teal" | "pink";
};

export default function InfoBanner({
  icon: Icon,
  title,
  description,
  variant = "teal",
}: Props) {
  const [show, setShow] = useState(true);
  if (!show) return null;

  const palette =
    variant === "pink"
      ? {
          border: "border-rose-200",
          bg: "bg-rose-50/40",
          icon: "text-rose-500",
          iconBg: "bg-rose-100",
          title: "text-rose-700",
          x: "text-rose-400 hover:bg-rose-100",
        }
      : {
          border: "border-brand-200",
          bg: "bg-brand-50/40",
          icon: "text-brand-500",
          iconBg: "bg-brand-100",
          title: "text-brand-700",
          x: "text-brand-400 hover:bg-brand-100",
        };

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border-2 border-dashed ${palette.border} ${palette.bg}`}
    >
      <button
        onClick={() => setShow(false)}
        className={`p-1.5 rounded-md ${palette.x}`}
        aria-label="إغلاق"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex-1 text-right">
        <h3 className={`flex items-center justify-end gap-2 font-bold ${palette.title}`}>
          {title}
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${palette.iconBg}`}>
            <Icon className={`w-4 h-4 ${palette.icon}`} />
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-6">{description}</p>
      </div>
    </div>
  );
}
