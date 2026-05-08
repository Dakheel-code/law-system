import type { LucideIcon } from "lucide-react";

export type RadioOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
};

export default function RadioGroup({ label, options, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const checked = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${
                checked
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  checked ? "border-brand-500" : "border-slate-300"
                }`}
              >
                {checked && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </span>
              <span>{opt.label}</span>
              <Icon className={`w-4 h-4 ${checked ? "text-brand-500" : "text-slate-400"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
