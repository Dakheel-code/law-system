import { Clock } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";

type Props = { title?: string; subtitle?: string };

export default function RecentActivities({
  title = "آخر النشاطات",
  subtitle = "أحدث التغييرات",
}: Props) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <EmptyState icon={Clock} text="لا توجد نشاطات حديثة" />
    </SectionCard>
  );
}
