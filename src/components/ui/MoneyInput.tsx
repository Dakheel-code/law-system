import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function MoneyInput(props: Props) {
  return (
    <div className="relative">
      <input
        type="number"
        step="0.01"
        min={0}
        placeholder="0.00"
        {...props}
        className={`w-full px-4 py-2.5 pl-14 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white ${props.className ?? ""}`}
        dir="ltr"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded">
        SAR
      </span>
    </div>
  );
}
