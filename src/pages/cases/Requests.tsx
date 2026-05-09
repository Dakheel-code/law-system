import { Link } from "react-router-dom";
import {
  ListChecks,
  Plus,
  Inbox,
  CheckCircle2,
  XCircle,
  Hourglass,
  FileText,
} from "lucide-react";
import CasesPageShell, { FilterSelect } from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import CasesTable from "../../components/cases/CasesTable";

const kpis = [
  { title: "إجمالي الطلبات", value: "0", icon: FileText, bg: "from-sky-400 to-sky-500" },
  { title: "بانتظار الإجراء", value: "0", icon: Hourglass, bg: "from-amber-400 to-amber-500" },
  { title: "مقبولة", value: "0", icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
  { title: "مرفوضة", value: "0", icon: XCircle, bg: "from-rose-400 to-rose-500" },
];

const columns = [
  "رقم الطلب",
  "تاريخ الإنشاء",
  "العميل",
  "نوع القضية",
  "الأولوية",
  "المحامي المسند",
  "الحالة",
  "إجراءات",
];

export default function Requests() {
  return (
    <CasesPageShell
      title="إدارة الطلبات"
      icon={ListChecks}
      primaryAction={
        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          فتح طلب
        </Link>
      }
      kpis={<CasesKpiStrip items={kpis} />}
      filters={
        <>
          <FilterSelect placeholder="كل الحالات" />
          <FilterSelect placeholder="كل الأنواع" />
          <FilterSelect placeholder="كل الأولويات" />
          <FilterSelect placeholder="كل المحامين" />
        </>
      }
      searchPlaceholder="ابحث برقم الطلب، اسم العميل، أو نوع القضية..."
    >
      <CasesTable columns={columns} emptyIcon={Inbox} emptyText="لا توجد طلبات" />
    </CasesPageShell>
  );
}
