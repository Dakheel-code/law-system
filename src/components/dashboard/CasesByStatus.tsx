import { PieChart as PieIcon } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";

export default function CasesByStatus() {
  return (
    <SectionCard title="القضايا حسب الحالة" subtitle="توزيع الحالات">
      <EmptyState icon={PieIcon} text="لا توجد بيانات" />
    </SectionCard>
  );
}
