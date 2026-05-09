import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  Hourglass,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-react";
import CasesPageShell from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import CasesTable from "../../components/cases/CasesTable";

const kpis = [
  { title: "نشطة", value: "0", icon: Hourglass, bg: "from-sky-400 to-sky-500" },
  { title: "مقبولة", value: "0", icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
  { title: "ملغاة", value: "0", icon: XCircle, bg: "from-rose-400 to-rose-500" },
];

const tabs = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد الانتظار" },
  { key: "accepted", label: "مقبولة" },
  { key: "cancelled", label: "ملغاة" },
];

const columns = [
  "إجراءات",
  "الحالة",
  "المحامي",
  "نوع القضية",
  "تاريخ الإنشاء",
  "رقم الطلب",
];

export default function MyRequests() {
  const [tab, setTab] = useState("all");

  return (
    <CasesPageShell
      title="طلباتي"
      icon={ClipboardList}
      primaryAction={
        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          طلب جديد
        </Link>
      }
      kpis={<CasesKpiStrip items={kpis} />}
      searchPlaceholder="ابحث في طلباتي..."
    >
      <div className="border-b border-slate-200 flex justify-end px-5">
        <div className="flex">
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
      </div>
      <CasesTable columns={columns} emptyIcon={Inbox} emptyText="لم تقدّم أي طلب بعد" />
    </CasesPageShell>
  );
}
