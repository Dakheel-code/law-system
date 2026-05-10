import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search, Trash2 } from "lucide-react";
import { useContracts, deleteContract } from "../../lib/contractStore";

const tabs = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "draft", label: "مسودة" },
  { key: "ended", label: "منتهي/ملغي" },
];

const columns = [
  "رقم العقد",
  "العميل",
  "العنوان",
  "نوع العقد",
  "القيمة",
  "الحالة",
  "إجراءات",
];

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-slate-100 text-slate-600" },
  active: { label: "نشط", color: "bg-emerald-50 text-emerald-700" },
  ended: { label: "منتهي", color: "bg-slate-100 text-slate-500" },
  cancelled: { label: "ملغي", color: "bg-rose-50 text-rose-600" },
};

const sumServices = (services: { qty: number; price: number }[]) =>
  services.reduce((sum, s) => sum + s.qty * s.price, 0);

export default function Contracts() {
  const { contracts, loading } = useContracts();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = contracts;
    if (tab !== "all") list = list.filter((c) => c.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.clientFullName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contracts, tab, search]);

  const totalValue = contracts.reduce((s, c) => s + sumServices(c.services), 0);
  const activeCount = contracts.filter((c) => c.status === "active").length;
  const draftCount = contracts.filter((c) => c.status === "draft").length;

  const kpis = [
    { title: "إجمالي التعاقدات", value: String(contracts.length), color: "text-slate-700" },
    { title: "نشط", value: String(activeCount), color: "text-slate-700" },
    { title: "مسودة", value: String(draftCount), color: "text-amber-600" },
    { title: "إجمالي القيمة (ر.س)", value: totalValue.toFixed(2), color: "text-emerald-600" },
    { title: "المحصل (ر.س)", value: "0.00", color: "text-violet-600" },
  ];

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`حذف العقد "${code}"؟`)) await deleteContract(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          إدارة التعاقدات
          <FileText className="w-5 h-5 text-brand-500" />
        </h2>
        <Link
          to="/contracts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          عقد جديد
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.title} className="card px-4 py-5 text-center">
            <div className={`text-3xl font-extrabold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.title}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="border-b border-slate-200 flex justify-start px-5">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-3 text-sm transition relative ${
                    active ? "text-brand-700 font-bold" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute -bottom-px right-0 left-0 h-0.5 bg-brand-500" />
                  )}
                </button>
              );
            })}
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالرقم / الاسم / العنوان..."
              className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-bold">
                  {columns.map((c) => (
                    <th key={c} className="px-3 py-3 text-right whitespace-nowrap">
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
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-16">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <FileText className="w-12 h-12 mb-3" strokeWidth={1.2} />
                        <span className="text-sm">لا توجد تعاقدات</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const total = sumServices(c.services);
                    const st = statusLabels[c.status] ?? { label: c.status, color: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-3 py-3 text-right text-xs font-mono text-slate-500">{c.code}</td>
                        <td className="px-3 py-3 text-right text-sm text-slate-700">
                          {c.clientFullName || "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-slate-700">{c.title}</td>
                        <td className="px-3 py-3 text-right text-sm text-slate-600">
                          {c.contractType || "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-slate-700" dir="ltr">
                          {total.toFixed(2)} SAR
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            title="حذف"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
