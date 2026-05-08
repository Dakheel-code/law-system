import { Calendar } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";

function todayStrings() {
  const now = new Date();
  const greg = now.toLocaleDateString("en-GB").replace(/\//g, "/");
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  return { greg: greg.split("/").reverse().join("/"), hijri };
}

export default function TodaySessions() {
  const { greg, hijri } = todayStrings();
  return (
    <SectionCard
      title="جلسات اليوم"
      subtitle={`${greg} – ${hijri} هـ - الجلسات المجدولة`}
    >
      <EmptyState icon={Calendar} text="لا توجد جلسات مجدولة لليوم" />
    </SectionCard>
  );
}
