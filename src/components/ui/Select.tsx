import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import type { Option } from "../../config/caseConfig";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  placeholder?: string;
};

export default function Select({ options, placeholder, className = "", ...rest }: Props) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={`w-full appearance-none px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}
