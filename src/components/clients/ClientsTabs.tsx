import { useState } from "react";
import { Users, ShieldCheck, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tabs: { key: string; label: string; count: number; icon: LucideIcon }[] = [
  { key: "all", label: "الكل", count: 0, icon: Users },
  { key: "with", label: "عندهم حساب", count: 0, icon: ShieldCheck },
  { key: "without", label: "بدون حساب", count: 0, icon: UserPlus },
];

export default function ClientsTabs() {
  const [active, setActive] = useState("all");

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
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
              {t.count}
            </span>
            {t.label}
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
