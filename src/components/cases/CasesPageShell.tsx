import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, RotateCcw } from "lucide-react";

type Props = {
  title: string;
  icon: LucideIcon;
  primaryAction?: ReactNode;
  kpis?: ReactNode;
  /**
   * Optional inline filter controls rendered alongside the reset+search.
   * If omitted, the shell skips the toolbar entirely so consumers that
   * render their own toolbar (e.g. CasesList) don't get a duplicate.
   */
  filters?: ReactNode;
  searchPlaceholder?: string;
  children: ReactNode;
};

export default function CasesPageShell({
  title,
  icon: Icon,
  primaryAction,
  kpis,
  filters,
  searchPlaceholder = "ابحث...",
  children,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          {title}
          <Icon className="w-5 h-5 text-brand-500" />
        </h2>
        {primaryAction}
      </div>

      {kpis}

      <div className="card">
        {filters && (
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 shrink-0">
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </button>
            {filters}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder={searchPlaceholder}
                className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function FilterSelect({ placeholder }: { placeholder: string }) {
  return (
    <select className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200">
      <option>{placeholder}</option>
    </select>
  );
}
