import type { LucideIcon } from "lucide-react";

export type CaseKpi = {
  title: string;
  value: string;
  icon: LucideIcon;
  bg: string;
};

export default function CasesKpiStrip({ items }: { items: CaseKpi[] }) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      style={items.length > 4 ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.title}
            className={`relative overflow-hidden rounded-2xl text-white p-5 shadow-card bg-gradient-to-l ${it.bg}`}
          >
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <Icon className="w-6 h-6 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">{it.title}</div>
                <div className="text-3xl font-extrabold mt-2">{it.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
