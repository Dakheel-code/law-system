import { useMemo, useState } from "react";
import {
  ChevronDown,
  Trash2,
  Mail,
  Phone,
  Paperclip,
  Search,
  User as UserIcon,
} from "lucide-react";
import ClientsKpiStrip from "../components/clients/ClientsKpiStrip";
import ClientsToolbar from "../components/clients/ClientsToolbar";
import ClientsTabs from "../components/clients/ClientsTabs";
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
  const clients = useClients();
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.idNumber.includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const visible = filtered.slice(0, pageSize);

  const handleDelete = (c: ClientRecord) => {
    if (confirm(`حذف العميل "${c.fullName}"؟`)) deleteClient(c.id);
  };

  return (
    <div className="space-y-5">
      <ClientsKpiStrip />
      <ClientsToolbar />
      <ClientsTabs />

      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهوية، الهاتف، البريد..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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
            {search && filtered.length !== clients.length && (
              <span className="text-xs"> (من أصل {clients.length})</span>
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <ClientsEmpty />
        ) : (
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
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 text-right text-xs font-mono text-slate-500">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-medium text-slate-700">
                          {c.fullName}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4 text-brand-500" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        {c.phone && (
                          <span className="inline-flex items-center gap-1 text-slate-600" dir="ltr">
                            {c.phone}
                            <Phone className="w-3 h-3 text-slate-400" />
                          </span>
                        )}
                        {c.email && (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-slate-500 truncate max-w-[200px]"
                            dir="ltr"
                          >
                            {c.email}
                            <Mail className="w-3 h-3 text-slate-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                        {clientTypeLabels[c.clientType] ?? c.clientType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">
                      {contractTypeLabels[c.contractType] ?? c.contractType}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {c.attachments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-bold">
                          <Paperclip className="w-3 h-3" />
                          {c.attachments.length}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(c)}
                        title="حذف"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
