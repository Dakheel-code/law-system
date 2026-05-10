import { useState } from "react";
import { Info } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import TodayHeader from "../components/calendar/TodayHeader";
import EventChips from "../components/calendar/EventChips";
import MonthGrid from "../components/calendar/MonthGrid";
import SelectedDayEvents from "../components/calendar/SelectedDayEvents";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Info}
        title="التقويم"
        description="عرض شامل لجميع المواعيد والجلسات والاستشارات. اضغط على أي يوم لعرض أحداثه."
      />

      <TodayHeader />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-extrabold text-slate-800">التقويم</h2>
          <EventChips />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <MonthGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <SelectedDayEvents
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      </div>
    </div>
  );
}
