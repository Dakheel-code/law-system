import { Users, ShieldCheck, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ClientsTab = "all" | "with" | "without";

type TabItem = { key: ClientsTab; label: string; icon: LucideIcon };

const tabs: TabItem[] = [
  { key: "all", label: "الكل", icon: Users },
  { key: "with", label: "عندهم حساب", icon: ShieldCheck },
  { key: "without", label: "بدون حساب", icon: UserPlus },
];

type Props = {
  active: ClientsTab;
  onChange: (key: ClientsTab) => void;
  counts: Record<ClientsTab, number>;
};

export default function ClientsTabs({ active, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
              isActive
                ? "bg-blue-500 text-white border-blue-500 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[t.key]}
            </span>
            {t.label}
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
