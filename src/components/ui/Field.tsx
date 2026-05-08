import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${inputBase} resize-none ${props.className ?? ""}`}
    />
  );
}
