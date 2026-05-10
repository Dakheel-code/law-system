import { useState } from "react";
import { FileText, Briefcase, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tabs: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "requests", label: "الطلبات", icon: FileText },
  { key: "cases", label: "القضايا", icon: Briefcase },
  { key: "clients", label: "العملاء", icon: Users },
  { key: "payments", label: "المدفوعات", icon: Wallet },
];

type Props = {
  active: string;
  onChange: (key: string) => void;
};

export default function ReportsTabs({ active, onChange }: Props) {
  return (
    <div className="border-b border-slate-200 flex justify-start gap-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition relative ${
              isActive
                ? "text-brand-700 font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{t.label}</span>
            <Icon className="w-4 h-4" />
            {isActive && (
              <span className="absolute -bottom-px right-0 left-0 h-0.5 bg-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export { tabs };

export function useReportsTab(initial = "requests") {
  return useState(initial);
}
