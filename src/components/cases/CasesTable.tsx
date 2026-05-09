import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  columns: string[];
  emptyIcon: LucideIcon;
  emptyText: string;
  rows?: ReactNode[][];
};

export default function CasesTable({ columns, emptyIcon: Icon, emptyText, rows = [] }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 text-xs text-slate-500 font-bold">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-right whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16">
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <Icon className="w-12 h-12 mb-3" strokeWidth={1.2} />
                  <span className="text-sm">{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-right">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
