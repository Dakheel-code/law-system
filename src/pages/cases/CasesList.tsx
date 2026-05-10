import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FolderCog,
  Plus,
  Folder,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Trash2,
} from "lucide-react";
import CasesPageShell, { FilterSelect } from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import { useCases, deleteCase } from "../../lib/caseStore";
import { caseTypes, courtTypes } from "../../config/caseConfig";

const columns = [
  "رقم القضية",
  "العميل",
  "نوع القضية",
  "المحكمة",
  "الأولوية",
  "الحالة",
  "إجراءات",
];

const caseTypeLabel = (v: string) =>
  caseTypes.find((t) => t.value === v)?.label ?? v ?? "—";
const courtTypeLabel = (v: string) =>
  courtTypes.find((t) => t.value === v)?.label ?? v ?? "—";

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

export default function CasesList() {
  const { cases, loading } = useCases();
  const navigate = useNavigate();

  const total = cases.length;
  const active = cases.filter((c) => c.status === "active").length;
  const ended = cases.filter((c) => c.status === "ended").length;
  const urgent = cases.filter((c) => c.urgency === "high" || c.urgency === "critical").length;
  const deferred = cases.filter((c) => c.status === "deferred").length;

  const kpis = [
    { title: "إجمالي القضايا", value: String(total), icon: Folder, bg: "from-sky-400 to-sky-500" },
    { title: "نشطة", value: String(active), icon: Briefcase, bg: "from-teal-500 to-brand-500" },
    { title: "منتهية", value: String(ended), icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
    { title: "عاجلة", value: String(urgent), icon: AlertOctagon, bg: "from-rose-400 to-rose-500" },
    { title: "مؤجلة", value: String(deferred), icon: Clock, bg: "from-amber-400 to-amber-500" },
  ];

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`حذف القضية "${code}"؟`)) await deleteCase(id);
  };

  return (
    <CasesPageShell
      title="إدارة القضايا"
      icon={FolderCog}
      primaryAction={
        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          فتح قضية جديدة
        </Link>
      }
      kpis={<CasesKpiStrip items={kpis} />}
      filters={
        <>
          <FilterSelect placeholder="كل الحالات" />
          <FilterSelect placeholder="كل الأنواع" />
        </>
      }
      searchPlaceholder="ابحث برقم القضية، اسم العميل، أو المحامي..."
    >
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-sm text-slate-400">
                  جارٍ التحميل...
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Folder className="w-12 h-12 mb-3" strokeWidth={1.2} />
                    <span className="text-sm">لا توجد قضايا</span>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/cases`)}
                  className="border-t border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-right text-xs font-mono text-slate-500">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-700">
                    {c.requestTitle || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                      {caseTypeLabel(c.caseType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {courtTypeLabel(c.courtType)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {priorityLabels[c.priority] ?? c.priority}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold">
                      {c.status === "active" ? "نشطة" : c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id, c.code);
                      }}
                      title="حذف"
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CasesPageShell>
  );
}
