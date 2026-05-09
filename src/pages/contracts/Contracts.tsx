import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search } from "lucide-react";
import ContractsKpis from "../../components/contracts/ContractsKpis";

const tabs = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "expiring", label: "ينتهي قريباً" },
  { key: "draft", label: "مسودة" },
  { key: "ended", label: "منتهي/ملغي" },
];

const columns = [
  "رقم العقد",
  "العميل",
  "نوع العميل",
  "العنوان",
  "الفترة",
  "القيمة",
  "المدفوع/المتبقي",
  "الاستهلاك",
  "صحة العقد",
  "الحالة",
  "إجراءات",
];

export default function Contracts() {
  const [tab, setTab] = useState("all");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/contracts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          عقد جديد
        </Link>
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          إدارة التعاقدات
          <FileText className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <ContractsKpis />

      <div className="card">
        <div className="border-b border-slate-200 flex justify-end px-5">
          <div className="flex">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-3 text-sm transition relative ${
                    active
                      ? "text-brand-700 font-bold"
                      : "text-slate-500 hover:text-slate-700"
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
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <FilterSelect placeholder="كل الأولويات" />
            <FilterSelect placeholder="كل الأنواع" />
            <FilterSelect placeholder="كل الحالات" />
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="بحث بالرقم / الاسم / العنوان..."
                className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
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
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <FileText className="w-12 h-12 mb-3" strokeWidth={1.2} />
                      <span className="text-sm">لا توجد تعاقدات</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ placeholder }: { placeholder: string }) {
  return (
    <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200">
      <option>{placeholder}</option>
    </select>
  );
}
