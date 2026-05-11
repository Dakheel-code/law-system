import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Trash2,
  Mail,
  Phone,
  Paperclip,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ClientsKpiStrip from "../components/clients/ClientsKpiStrip";
import ClientsToolbar, {
  defaultAdvancedFilters,
  type ClientsAdvancedFilters,
} from "../components/clients/ClientsToolbar";
import ClientsTabs, { type ClientsTab } from "../components/clients/ClientsTabs";
import ClientsEmpty from "../components/clients/ClientsEmpty";
import {
  useClients,
  deleteClient,
  type ClientRecord,
} from "../lib/clientStore";

const clientTypeLabels: Record<string, string> = {
  individual: "فرد",
  private: "قطاع خاص",
  institution: "مؤسسة",
  government: "جهة حكومية",
  "semi-government": "شبه حكومية",
};

const contractTypeLabels: Record<string, string> = {
  default: "افتراضي",
  single: "أحادي",
  annual: "سنوي",
};

export default function Clients() {
  const { clients, loading } = useClients();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ClientsTab>("all");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ClientsAdvancedFilters>(
    defaultAdvancedFilters
  );

  const onAdvancedChange = (patch: Partial<ClientsAdvancedFilters>) => {
    setAdvancedFilters((p) => ({ ...p, ...patch }));
    setPage(1);
  };
  const onResetAdvanced = () => {
    setAdvancedFilters(defaultAdvancedFilters);
    setPage(1);
  };
  const onResetAll = () => {
    setSearch("");
    setTab("all");
    setAdvancedFilters(defaultAdvancedFilters);
    setPage(1);
  };

  // Tab counts
  const counts = useMemo(() => {
    const withAcc = clients.filter((c) => !!c.email).length;
    return {
      all: clients.length,
      with: withAcc,
      without: clients.length - withAcc,
    };
  }, [clients]);

  // Apply: tab → search → advanced filters
  const filtered = useMemo(() => {
    let list = clients;

    // Tab filter
    if (tab === "with") list = list.filter((c) => !!c.email);
    else if (tab === "without") list = list.filter((c) => !c.email);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.idNumber.includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }

    // Advanced filters
    if (advancedFilters.clientType !== "all") {
      list = list.filter((c) => c.clientType === advancedFilters.clientType);
    }
    if (advancedFilters.contractType !== "all") {
      list = list.filter((c) => c.contractType === advancedFilters.contractType);
    }
    if (advancedFilters.hasAttachments === "yes") {
      list = list.filter((c) => c.attachments.length > 0);
    } else if (advancedFilters.hasAttachments === "no") {
      list = list.filter((c) => c.attachments.length === 0);
    }

    return list;
  }, [clients, tab, search, advancedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openClient = (c: ClientRecord) => navigate(`/clients/${c.id}`);

  const handleDelete = async (c: ClientRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`حذف العميل "${c.fullName}"؟`)) await deleteClient(c.id);
  };

  const hasActiveFilters =
    search !== "" ||
    tab !== "all" ||
    advancedFilters.clientType !== "all" ||
    advancedFilters.contractType !== "all" ||
    advancedFilters.hasAttachments !== "all";

  return (
    <div className="space-y-5">
      <ClientsKpiStrip />
      <ClientsToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        advancedFilters={advancedFilters}
        onAdvancedChange={onAdvancedChange}
        onResetAdvanced={onResetAdvanced}
      />
      <ClientsTabs
        active={tab}
        onChange={(k) => {
          setTab(k);
          setPage(1);
        }}
        counts={counts}
      />

      <div className="card">
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none pr-8 pl-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="text-sm text-slate-500">
            <span className="font-bold text-slate-700">{filtered.length}</span> عميل
            {hasActiveFilters && filtered.length !== clients.length && (
              <span className="text-xs"> (من أصل {clients.length})</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            جارٍ التحميل...
          </div>
        ) : visible.length === 0 ? (
          <ClientsEmpty
            onReset={onResetAll}
            showReset={hasActiveFilters}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-xs text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-right">رقم العميل</th>
                    <th className="px-4 py-3 text-right">العميل</th>
                    <th className="px-4 py-3 text-right">التواصل</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">التعاقد</th>
                    <th className="px-4 py-3 text-right">المرفقات</th>
                    <th className="px-4 py-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openClient(c)}
                      className="border-t border-slate-100 hover:bg-brand-50/40 transition cursor-pointer group"
                    >
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-mono text-slate-500 group-hover:text-brand-700">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 ring-2 ring-white group-hover:ring-brand-100">
                            <UserIcon className="w-4 h-4 text-brand-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">
                              {c.fullName}
                            </div>
                            {c.idNumber && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                <bdi dir="ltr">{c.idNumber}</bdi>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex flex-col gap-0.5 items-start">
                          {c.phone ? (
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <bdi dir="ltr">{c.phone}</bdi>
                            </span>
                          ) : null}
                          {c.email ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-xs text-slate-500 max-w-[220px]"
                              title={c.email}
                            >
                              <Mail className="w-3 h-3 text-sky-500 shrink-0" />
                              <bdi dir="ltr" className="truncate">
                                {c.email}
                              </bdi>
                            </span>
                          ) : null}
                          {!c.phone && !c.email && (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                          {clientTypeLabels[c.clientType] ?? c.clientType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-bold">
                          {contractTypeLabels[c.contractType] ?? c.contractType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {c.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-bold">
                            <Paperclip className="w-3 h-3" />
                            {c.attachments.length}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:-translate-x-1 transition" />
                          <button
                            onClick={(e) => handleDelete(c, e)}
                            title="حذف"
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-slate-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>
                <div className="text-xs text-slate-500">
                  صفحة <bdi dir="ltr">{safePage}</bdi> من{" "}
                  <bdi dir="ltr">{totalPages}</bdi>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
