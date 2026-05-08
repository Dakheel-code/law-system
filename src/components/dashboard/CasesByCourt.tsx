import { BarChart3 } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";

export default function CasesByCourt() {
  return (
    <SectionCard
      title="القضايا حسب نوع المحكمة"
      subtitle="توزيع القضايا على المحاكم"
    >
      <EmptyState icon={BarChart3} text="لا توجد بيانات" />
    </SectionCard>
  );
}
