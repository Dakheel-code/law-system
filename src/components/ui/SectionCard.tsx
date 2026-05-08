import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export default function SectionCard({ title, subtitle, className = "", children }: Props) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 text-right">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
