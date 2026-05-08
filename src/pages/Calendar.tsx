import { Info } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import TodayHeader from "../components/calendar/TodayHeader";
import EventChips from "../components/calendar/EventChips";
import MonthGrid from "../components/calendar/MonthGrid";

export default function CalendarPage() {
  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Info}
        title="التقويم"
        description="عرض شامل لجميع المواعيد والجلسات والاستشارات. يمكنك تصفّح الأحداث حسب التاريخ ونوع الموعد."
      />

      <TodayHeader />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <EventChips />
          <h2 className="text-xl font-extrabold text-slate-800">التقويم</h2>
        </div>
      </div>

      <MonthGrid />
    </div>
  );
}
