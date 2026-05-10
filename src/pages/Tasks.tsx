import { useState } from "react";
import { Hexagon, Plus } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import TasksKpis from "../components/tasks/TasksKpis";
import TasksFilters from "../components/tasks/TasksFilters";
import KanbanBoard from "../components/tasks/KanbanBoard";
import NewTaskModal from "../components/tasks/NewTaskModal";

export default function Tasks() {
  const [showNewTask, setShowNewTask] = useState(false);

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Hexagon}
        title="لوحة المهام"
        description="تنظيم وتتبع المهام بطريقة كانبان. يمكنك إنشاء المهام وتوزيعها ومتابعة تقدمها."
      />

      <TasksKpis />

      <div className="card p-5 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-4 h-4" />
            مهمة جديدة
          </button>
          <h2 className="text-lg font-extrabold text-slate-800">إدارة المهام</h2>
        </div>
        <TasksFilters />
        <KanbanBoard />
      </div>

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
