import { useMemo, useState } from "react";
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
  Eye,
  Edit3,
  Search,
  RotateCcw,
} from "lucide-react";
import CasesPageShell from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import { useCases, deleteCase } from "../../lib/caseStore";
import { useClients } from "../../lib/clientStore";
import { useUsers } from "../../lib/userStore";
import { useOffice } from "../../lib/officeStore";
import { priorities } from "../../config/caseConfig";

const columns = [
  "رقم القضية",
  "العميل",
  "المحامي",
  "عنوان الطلب",
  "نوع القضية",
  "المحكمة",
  "الأولوية",
  "الحالة",
  "إجراءات",
];

const labelFor = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v ?? "—";

const clientInitials = (fullName: string): string =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase() || "؟";

const priorityChip: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};

const statusChip: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  ended: "bg-slate-100 text-slate-700",
  deferred: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
};
const statusLabel: Record<string, string> = {
  active: "نشطة",
  ended: "منتهية",
  deferred: "مؤجلة",
  pending: "بانتظار الإجراء",
};

export default function CasesList() {
  const { cases, loading } = useCases();
  const { clients } = useClients();
  const { users } = useUsers();
  const { office } = useOffice();
  const navigate = useNavigate();

  const caseTypes = office?.caseTypes ?? [];
  const courtTypes = office?.courtTypes ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const clientById = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );
  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.caseType !== typeFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (q) {
        const client = c.clientId ? clientById.get(c.clientId) : null;
        const hay = [
          c.code,
          c.caseNumber,
          c.requestTitle,
          c.description,
          c.otherPartyName,
          c.circuitName,
          c.claimSubject,
          client?.fullName ?? "",
          client?.phone ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cases, search, statusFilter, typeFilter, priorityFilter, clientById]);

  const total = cases.length;
  const active = cases.filter((c) => c.status === "active").length;
  const ended = cases.filter((c) => c.status === "ended").length;
  const urgent = cases.filter(
    (c) => c.urgency === "high" || c.urgency === "critical"
  ).length;
  const deferred = cases.filter((c) => c.status === "deferred").length;

  const kpis = [
    {
      title: "إجمالي القضايا",
      value: String(total),
      icon: Folder,
      bg: "from-sky-400 to-sky-500",
    },
    {
      title: "نشطة",
      value: String(active),
      icon: Briefcase,
      bg: "from-teal-500 to-brand-500",
    },
    {
      title: "منتهية",
      value: String(ended),
      icon: CheckCircle2,
      bg: "from-emerald-500 to-emerald-600",
    },
    {
      title: "عاجلة",
      value: String(urgent),
      icon: AlertOctagon,
      bg: "from-rose-400 to-rose-500",
    },
    {
      title: "مؤجلة",
      value: String(deferred),
      icon: Clock,
      bg: "from-amber-400 to-amber-500",
    },
  ];

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`حذف القضية "${code}"؟`)) await deleteCase(id);
  };

  const onReset = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPriorityFilter("all");
  };

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    priorityFilter !== "all";

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
    >
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <button
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين
        </button>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="all">كل الأولويات</option>
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="all">كل الأنواع</option>
          {caseTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="ended">منتهية</option>
          <option value="deferred">مؤجلة</option>
          <option value="pending">بانتظار الإجراء</option>
        </select>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم القضية، اسم العميل، أو الوصف..."
            className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="px-4 py-2 text-xs text-amber-600 border-b border-slate-100 text-right">
          النتائج: <bdi dir="ltr">{filtered.length}</bdi> من{" "}
          <bdi dir="ltr">{cases.length}</bdi>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 font-bold">
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  className="px-4 py-3 text-right whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-slate-400"
                >
                  جارٍ التحميل...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Folder className="w-12 h-12 mb-3" strokeWidth={1.2} />
                    <span className="text-sm">
                      {hasActiveFilters
                        ? "لا توجد قضايا مطابقة للفلاتر"
                        : "لا توجد قضايا"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const client = c.clientId ? clientById.get(c.clientId) : null;
                // Primary lawyer: first try `assignments` (new schema), then
                // fall back to legacy `assignedLawyer` / `assignedLawyers[0]`.
                const primaryUserId =
                  c.assignments?.find((a) => a.role === "primary")?.userId ??
                  c.assignments?.[0]?.userId ??
                  c.assignedLawyer ??
                  c.assignedLawyers?.[0] ??
                  null;
                const lawyer = primaryUserId ? userById.get(primaryUserId) : null;
                const lawyerCount = c.assignments?.length ?? 0;
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="border-t border-slate-100 hover:bg-brand-50/40 transition cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-right text-xs font-mono text-slate-500 group-hover:text-brand-700">
                      {c.caseNumber || c.code}
                    </td>
                    <td className="px-4 py-3">
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-brand-700 text-[11px] font-extrabold">
                            {clientInitials(client.fullName)}
                          </div>
                          <div className="min-w-0 text-right">
                            <div className="text-sm font-bold text-slate-800 truncate">
                              {client.fullName}
                            </div>
                            {client.phone && (
                              <div
                                className="text-[11px] text-slate-400 mt-0.5 font-mono"
                                dir="ltr"
                              >
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lawyer ? (
                        <div className="flex items-center gap-2">
                          {lawyer.avatarDataUrl ? (
                            <img
                              src={lawyer.avatarDataUrl}
                              alt={lawyer.fullName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 text-[11px] font-extrabold">
                              {clientInitials(lawyer.fullName)}
                            </div>
                          )}
                          <div className="min-w-0 text-right">
                            <div className="text-sm font-bold text-slate-800 truncate">
                              {lawyer.fullName || lawyer.code}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {lawyerCount > 1 ? (
                                <span>
                                  المحامي الأساسي + {lawyerCount - 1} مسند
                                </span>
                              ) : (
                                "المحامي الأساسي"
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700 max-w-[240px] truncate">
                      {c.requestTitle || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                        {labelFor(caseTypes, c.caseType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {labelFor(courtTypes, c.courtType)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          priorityChip[c.priority] ?? priorityChip.medium
                        }`}
                      >
                        {labelFor(priorities, c.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          statusChip[c.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabel[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cases/${c.id}`);
                          }}
                          title="عرض التفاصيل"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cases/${c.id}/edit`);
                          }}
                          title="تعديل"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.id, c.code);
                          }}
                          title="حذف"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CasesPageShell>
  );
}
