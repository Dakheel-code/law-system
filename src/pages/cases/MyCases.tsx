import { useState } from "react";
import {
  Folder,
  Briefcase,
  CalendarClock,
  AlertOctagon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import CasesPageShell, { FilterSelect } from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import CasesTable from "../../components/cases/CasesTable";

const kpis = [
  { title: "نشطة", value: "0", icon: Briefcase, bg: "from-sky-400 to-sky-500" },
  { title: "جلسات قادمة", value: "0", icon: CalendarClock, bg: "from-violet-500 to-violet-600" },
  { title: "عاجلة", value: "0", icon: AlertOctagon, bg: "from-rose-400 to-rose-500" },
  { title: "منتهية", value: "0", icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
];

const tabs = [
  { key: "active", label: "نشطة" },
  { key: "ended", label: "منتهية" },
  { key: "deferred", label: "مؤجلة" },
];

const columns = [
  "رقم القضية",
  "العميل",
  "المحكمة",
  "نوع القضية",
  "الجلسة القادمة",
  "الحالة",
  "إجراءات",
];

export default function MyCases() {
  const [tab, setTab] = useState("active");

  return (
    <CasesPageShell
      title="قضاياي"
      icon={Folder}
      kpis={<CasesKpiStrip items={kpis} />}
      filters={
        <>
          <FilterSelect placeholder="كل الأنواع" />
          <FilterSelect placeholder="كل المحاكم" />
        </>
      }
      searchPlaceholder="ابحث في قضاياي..."
    >
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
      <CasesTable columns={columns} emptyIcon={Clock} emptyText="لا توجد قضايا مسندة لك" />
    </CasesPageShell>
  );
}
