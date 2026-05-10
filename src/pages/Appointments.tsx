import { useMemo, useState } from "react";
import { Clock, CalendarX2, Calendar, AlertOctagon, Briefcase, ListTodo } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import AppointmentsKpis from "../components/appointments/AppointmentsKpis";
import TypeChips from "../components/appointments/TypeChips";
import ViewToolbar from "../components/appointments/ViewToolbar";
import FilterBar from "../components/appointments/FilterBar";
import EmptyState from "../components/ui/EmptyState";
import { useTasks, type TaskRecord } from "../lib/taskStore";
import { useCases, type CaseRecord } from "../lib/caseStore";
import { defaultFilters, type AppointmentFilters } from "../components/appointments/filtersTypes";

type Appointment = {
  key: string;
  title: string;
  description: string;
  date: string;
  type: "task" | "case";
  priority: string;
  status: string;
  code: string;
  assignedTo: string | null;
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
  assignedTo: t.assignedTo,
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
  assignedTo: c.assignedLawyer,
});

// ---- Date range helpers ----

const todayStr = () => new Date().toISOString().slice(0, 10);

const periodRange = (period: string): { from: string; to: string } | null => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const iso = (dt: Date) => dt.toISOString().slice(0, 10);

  if (period === "today") {
    const today = new Date(y, m, d);
    return { from: iso(today), to: iso(today) };
  }
  if (period === "week") {
    const day = now.getDay();
    const offset = day === 6 ? 0 : day + 1; // Saturday start
    const start = new Date(y, m, d - offset);
    const end = new Date(y, m, d - offset + 6);
    return { from: iso(start), to: iso(end) };
  }
  if (period === "month") {
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return { from: iso(start), to: iso(end) };
  }
  return null; // "all"
};

const matchesStatus = (a: Appointment, status: string): boolean => {
  if (status === "all") return true;
  const isCompleted = a.status === "done" || a.status === "ended";
  const isOverdue = a.date < todayStr() && !isCompleted;
  if (status === "completed") return isCompleted;
  if (status === "overdue") return isOverdue;
  if (status === "pending") return !isCompleted && !isOverdue;
  return true;
};

const matchesScope = (a: Appointment, scope: string): boolean => {
  if (scope === "all") return true;
  if (scope === "ended") {
    return a.status === "done" || a.status === "ended" || a.date < todayStr();
  }
  return true;
};

// ---- Page ----

export default function Appointments() {
  const { tasks } = useTasks();
  const { cases } = useCases();
  const [filters, setFilters] = useState<AppointmentFilters>(defaultFilters);

  const onFilterChange = (patch: Partial<AppointmentFilters>) =>
    setFilters((p) => ({ ...p, ...patch }));
  const onReset = () => setFilters(defaultFilters);

  const today = new Date();
  const tStr = todayStr();

  const allAppointments = useMemo<Appointment[]>(() => {
    const list: Appointment[] = [];
    tasks.forEach((t) => {
      if (t.dueDate && !t.archived) list.push(taskToAppointment(t));
    });
    cases.forEach((c) => {
      if (c.startDate) list.push(caseToAppointment(c));
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, cases]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const range = periodRange(filters.period);
    return allAppointments.filter((a) => {
      if (filters.type !== "all" && a.type !== filters.type) return false;
      if (filters.lawyer !== "all" && a.assignedTo !== filters.lawyer) return false;
      if (!matchesStatus(a, filters.status)) return false;
      if (!matchesScope(a, filters.dateScope)) return false;
      if (range && (a.date < range.from || a.date > range.to)) return false;
      if (q) {
        const hay = `${a.title} ${a.description} ${a.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allAppointments, filters]);

  const todayAppointments = filtered.filter((a) => a.date === tStr);
  const upcomingAppointments = filtered.filter(
    (a) => a.date >= tStr && a.status !== "done" && a.status !== "ended"
  );

  const handleExport = () => {
    const rows = [
      ["الكود", "العنوان", "النوع", "الحالة", "الأولوية", "التاريخ"].join(","),
      ...filtered.map((a) =>
        [a.code, a.title, a.type, a.status, a.priority, a.date]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob(["﻿" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments-${tStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Clock}
        title="مركز المواعيد"
        description="عرض موحّد لجميع مواعيدك — جلسات القضايا والمهام المجدولة. استخدم الفلاتر وأوضاع العرض المتعددة لإدارة مواعيدك بكفاءة."
      />

      <AppointmentsKpis />
      <TypeChips filters={filters} onChange={onFilterChange} />
      <ViewToolbar
        filters={filters}
        onChange={onFilterChange}
        onExport={handleExport}
        onPrint={handlePrint}
      />
      <FilterBar filters={filters} onChange={onFilterChange} onReset={onReset} />

      <div className="flex items-center justify-start gap-3 text-xs text-slate-500">
        <span className="px-2 py-1 rounded-md bg-slate-100">
          النتائج: <bdi dir="ltr">{filtered.length}</bdi>
        </span>
        {(filters.search ||
          filters.lawyer !== "all" ||
          filters.status !== "all" ||
          filters.period !== "all" ||
          filters.type !== "all" ||
          filters.dateScope !== "all") && (
          <span className="text-amber-600">فلاتر مطبّقة</span>
        )}
      </div>

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
