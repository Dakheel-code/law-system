import { Clock, CalendarX2, Calendar } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import AppointmentsKpis from "../components/appointments/AppointmentsKpis";
import TypeChips from "../components/appointments/TypeChips";
import ViewToolbar from "../components/appointments/ViewToolbar";
import FilterBar from "../components/appointments/FilterBar";
import SectionCard from "../components/ui/SectionCard";
import EmptyState from "../components/ui/EmptyState";

function todayStrings() {
  const now = new Date();
  const greg = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  return { greg, hijri };
}

export default function Appointments() {
  const { greg, hijri } = todayStrings();

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Clock}
        title="مركز المواعيد"
        description="عرض موحّد لجميع مواعيدك — جلسات القضايا، الاستشارات، كتابة العدل، عقود الزواج، والمهام. استخدم الفلاتر وأوضاع العرض المتعددة لإدارة مواعيدك بكفاءة."
      />

      <AppointmentsKpis />
      <TypeChips />
      <ViewToolbar />
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="جميع المواعيد" subtitle="0 موعد">
          <EmptyState
            icon={CalendarX2}
            text="لا توجد مواعيد في الفترة المحددة — جرب تغيير الفلاتر أو الفترة الزمنية"
          />
        </SectionCard>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              0 موعد
            </span>
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-800">مواعيد اليوم</h3>
              <p className="text-xs text-slate-400 mt-0.5">{greg} – {hijri} هـ</p>
            </div>
          </div>
          <EmptyState icon={Calendar} text="لا توجد مواعيد اليوم" />
        </div>
      </div>
    </div>
  );
}
