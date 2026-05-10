import { useMemo } from "react";
import { Clock, CalendarX2, Calendar, AlertOctagon, Briefcase, ListTodo } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import AppointmentsKpis from "../components/appointments/AppointmentsKpis";
import TypeChips from "../components/appointments/TypeChips";
import ViewToolbar from "../components/appointments/ViewToolbar";
import FilterBar from "../components/appointments/FilterBar";
import EmptyState from "../components/ui/EmptyState";
import { useTasks, type TaskRecord } from "../lib/taskStore";
import { useCases, type CaseRecord } from "../lib/caseStore";

type Appointment = {
  key: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: "task" | "case";
  priority: string;
  status: string;
  code: string;
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
  critical: "bg-rose-100 text-rose-800",
};
const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
  critical: "حرجة",
};

const formatGreg = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const formatHijri = (d: Date) =>
  new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

const taskToAppointment = (t: TaskRecord): Appointment => ({
  key: `task-${t.id}`,
  title: t.title,
  description: t.description,
  date: t.dueDate as string,
  type: "task",
  priority: t.priority,
  status: t.status,
  code: t.code,
});

const caseToAppointment = (c: CaseRecord): Appointment => ({
  key: `case-${c.id}`,
  title: c.requestTitle || c.code,
  description: c.description,
  date: c.startDate as string,
  type: "case",
  priority: c.priority,
  status: c.status,
  code: c.code,
});

export default function Appointments() {
  const { tasks } = useTasks();
  const { cases } = useCases();

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const appointments = useMemo<Appointment[]>(() => {
    const list: Appointment[] = [];
    tasks.forEach((t) => {
      if (t.dueDate && !t.archived) list.push(taskToAppointment(t));
    });
    cases.forEach((c) => {
      if (c.startDate) list.push(caseToAppointment(c));
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, cases]);

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter(
    (a) =>
      a.date >= todayStr && a.status !== "done" && a.status !== "ended"
  );

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Clock}
        title="مركز المواعيد"
        description="عرض موحّد لجميع مواعيدك — جلسات القضايا والمهام المجدولة. استخدم الفلاتر وأوضاع العرض المتعددة لإدارة مواعيدك بكفاءة."
      />

      <AppointmentsKpis />
      <TypeChips />
      <ViewToolbar />
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {upcomingAppointments.length} موعد
            </span>
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-800">جميع المواعيد القادمة</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مرتّبة حسب التاريخ
              </p>
            </div>
          </div>

          {upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              text="لا توجد مواعيد قادمة"
            />
          ) : (
            <ul className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin">
              {upcomingAppointments.map((a) => (
                <AppointmentRow key={a.key} appt={a} />
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {todayAppointments.length} موعد
            </span>
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-800">مواعيد اليوم</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatGreg(today)} – {formatHijri(today)} هـ
              </p>
            </div>
          </div>

          {todayAppointments.length === 0 ? (
            <EmptyState icon={Calendar} text="لا توجد مواعيد اليوم" />
          ) : (
            <ul className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin">
              {todayAppointments.map((a) => (
                <AppointmentRow key={a.key} appt={a} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const date = new Date(appt.date);
  const dateLabel = date.toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
  });
  const isPastDue =
    appt.date < new Date().toISOString().slice(0, 10) &&
    appt.status !== "done" &&
    appt.status !== "ended";

  const TypeIcon = appt.type === "case" ? Briefcase : ListTodo;
  const typeColor =
    appt.type === "case" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700";

  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-lg border transition ${
        isPastDue
          ? "border-rose-200 bg-rose-50/40"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="text-[10px] text-slate-500">{dateLabel}</span>
      </div>

      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
          priorityColors[appt.priority] ?? priorityColors.medium
        }`}
      >
        {appt.priority === "urgent" || appt.priority === "critical" ? (
          <AlertOctagon className="w-3 h-3" />
        ) : null}
        {priorityLabels[appt.priority] ?? appt.priority}
      </span>

      <div className="flex-1 min-w-0 text-right">
        <div className="text-sm font-bold text-slate-700 truncate">{appt.title}</div>
        {appt.description && (
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {appt.description}
          </div>
        )}
        <div className="text-[10px] text-slate-400 mt-0.5 font-mono" dir="ltr">
          {appt.code}
        </div>
      </div>

      <div
        className={`w-9 h-9 rounded-lg ${typeColor} flex items-center justify-center shrink-0`}
      >
        <TypeIcon className="w-4 h-4" />
      </div>
    </li>
  );
}
