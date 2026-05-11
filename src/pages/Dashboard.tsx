import WelcomeCard from "../components/dashboard/WelcomeCard";
import KPICards from "../components/dashboard/KPICards";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import TodayAppointments from "../components/dashboard/TodayAppointments";
import TasksOverview from "../components/dashboard/TasksOverview";
import LatestCases from "../components/dashboard/LatestCases";
import RevenueChart from "../components/dashboard/RevenueChart";
import LawyersStats from "../components/dashboard/LawyersStats";
import UpcomingSessions from "../components/dashboard/UpcomingSessions";

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <WelcomeCard />
      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <DashboardCalendar />
        <TodayAppointments />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <TasksOverview />
        <UpcomingSessions />
        <LatestCases />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <LawyersStats />
      </div>
    </div>
  );
}
