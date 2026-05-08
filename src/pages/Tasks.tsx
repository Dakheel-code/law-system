import { Hexagon } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import TasksKpis from "../components/tasks/TasksKpis";
import TasksToolbar from "../components/tasks/TasksToolbar";
import TasksFilters from "../components/tasks/TasksFilters";
import KanbanBoard from "../components/tasks/KanbanBoard";

export default function Tasks() {
  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Hexagon}
        title="لوحة المهام"
        description="تنظيم وتتبع المهام بطريقة كانبان. يمكنك إنشاء المهام وتوزيعها ومتابعة تقدمها."
      />

      <TasksKpis />

      <div className="card p-5 space-y-5">
        <TasksToolbar />
        <TasksFilters />
        <KanbanBoard />
      </div>
    </div>
  );
}
