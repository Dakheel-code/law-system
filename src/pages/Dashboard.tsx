import WelcomeCard from "../components/dashboard/WelcomeCard";
import KPICards from "../components/dashboard/KPICards";
import RevenueChart from "../components/dashboard/RevenueChart";
import CasesByStatus from "../components/dashboard/CasesByStatus";
import TodaySessions from "../components/dashboard/TodaySessions";
import RecentActivities from "../components/dashboard/RecentActivities";
import CasesByCourt from "../components/dashboard/CasesByCourt";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <WelcomeCard />
      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <CasesByStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySessions />
        <RecentActivities />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CasesByCourt />
        <RecentActivities title="آخر النشاطات" subtitle="سجل الأحداث الأخيرة" />
      </div>
    </div>
  );
}
