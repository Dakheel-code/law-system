import { Link } from "react-router-dom";
import {
  Briefcase,
  FolderCog,
  Plus,
  Folder,
  CheckCircle2,
  Clock,
  AlertOctagon,
} from "lucide-react";
import CasesPageShell, { FilterSelect } from "../../components/cases/CasesPageShell";
import CasesKpiStrip from "../../components/cases/CasesKpiStrip";
import CasesTable from "../../components/cases/CasesTable";

const kpis = [
  { title: "إجمالي القضايا", value: "0", icon: Folder, bg: "from-sky-400 to-sky-500" },
  { title: "نشطة", value: "0", icon: Briefcase, bg: "from-teal-500 to-brand-500" },
  { title: "منتهية", value: "0", icon: CheckCircle2, bg: "from-emerald-500 to-emerald-600" },
  { title: "عاجلة", value: "0", icon: AlertOctagon, bg: "from-rose-400 to-rose-500" },
  { title: "مؤجلة", value: "0", icon: Clock, bg: "from-amber-400 to-amber-500" },
];

const columns = [
  "رقم القضية",
  "العميل",
  "المحامي",
  "نوع القضية",
  "المحكمة",
  "الجلسة القادمة",
  "الحالة",
  "إجراءات",
];

export default function CasesList() {
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
          <FilterSelect placeholder="كل المحامين" />
          <FilterSelect placeholder="كل المحاكم" />
        </>
      }
      searchPlaceholder="ابحث برقم القضية، اسم العميل، أو المحامي..."
    >
      <CasesTable columns={columns} emptyIcon={Folder} emptyText="لا توجد قضايا" />
    </CasesPageShell>
  );
}
