import { Link } from "react-router-dom";
import { Briefcase, AlertOctagon, ChevronLeft } from "lucide-react";
import { useCases } from "../../lib/caseStore";

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
  critical: "bg-rose-100 text-rose-800",
};
const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
  critical: "حرجة",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
  ended: "bg-slate-100 text-slate-600",
};

export default function LatestCases() {
  const { cases } = useCases();
  const recent = [...cases]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <Link
          to="/cases"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          كل القضايا ←
        </Link>
        <div className="text-right">
          <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
            آخر القضايا
            <Briefcase className="w-4 h-4 text-brand-500" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {cases.length} قضية في النظام
          </p>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Briefcase className="w-10 h-10 mb-2" strokeWidth={1.2} />
          <p className="text-xs text-slate-500">لا توجد قضايا بعد</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {recent.map((c) => {
            const dateLabel = new Date(c.createdAt).toLocaleDateString(
              "ar-EG-u-nu-latn",
              { day: "numeric", month: "short" }
            );
            return (
              <li
                key={c.id}
                className="group flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-brand-50/40 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:-translate-x-1 transition shrink-0" />
                <div className="flex flex-col items-start gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      priorityColors[c.priority] ?? priorityColors.medium
                    }`}
                  >
                    {c.priority === "urgent" || c.priority === "critical" ? (
                      <AlertOctagon className="w-2.5 h-2.5" />
                    ) : null}
                    {priorityLabels[c.priority] ?? c.priority}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      statusColors[c.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-bold text-slate-700 truncate">
                    {c.requestTitle || c.code}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2 justify-end">
                    {c.caseType && (
                      <span className="text-slate-400">{c.caseType}</span>
                    )}
                    <span className="font-mono text-slate-400" dir="ltr">
                      {c.code}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0">
                  <bdi dir="ltr">{dateLabel}</bdi>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
