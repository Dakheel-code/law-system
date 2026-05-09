import {
  Globe,
  AlertOctagon,
  Calendar,
  PackageOpen,
} from "lucide-react";
import CasesPageShell, { FilterSelect } from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import CasesTable from "../../components/cases/CasesTable";

const kpis = [
  { title: "متاحة الآن", value: "0", icon: Globe, bg: "from-sky-400 to-sky-500" },
  { title: "عالية الأولوية", value: "0", icon: AlertOctagon, bg: "from-rose-400 to-rose-500" },
  { title: "جديدة اليوم", value: "0", icon: Calendar, bg: "from-emerald-500 to-emerald-600" },
];

const columns = [
  "رقم الطلب",
  "العميل",
  "نوع القضية",
  "تاريخ الإنشاء",
  "الأولوية",
  "استلام",
];

export default function AvailableRequests() {
  return (
    <CasesPageShell
      title="الطلبات المتاحة"
      icon={Globe}
      kpis={<CasesKpiStrip items={kpis} />}
      filters={
        <>
          <FilterSelect placeholder="كل الأنواع" />
          <FilterSelect placeholder="كل المحاكم" />
          <FilterSelect placeholder="كل الأولويات" />
        </>
      }
      searchPlaceholder="ابحث في الطلبات المتاحة..."
    >
      <CasesTable
        columns={columns}
        emptyIcon={PackageOpen}
        emptyText="لا توجد طلبات متاحة حالياً"
      />
    </CasesPageShell>
  );
}
