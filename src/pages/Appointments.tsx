import { useMemo, useState } from "react";
import {
  Clock,
  CalendarX2,
  AlertOctagon,
  Briefcase,
  ListTodo,
  Gavel,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import AppointmentsKpis from "../components/appointments/AppointmentsKpis";
import TypeChips from "../components/appointments/TypeChips";
import ViewToolbar from "../components/appointments/ViewToolbar";
import FilterBar from "../components/appointments/FilterBar";
import EmptyState from "../components/ui/EmptyState";
import { useTasks, type TaskRecord } from "../lib/taskStore";
import { useCases, type CaseRecord } from "../lib/caseStore";
import {
  defaultFilters,
  type AppointmentFilters,
} from "../components/appointments/filtersTypes";

type Appointment = {
  key: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: "task" | "case" | "session";
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

const statusLabels: Record<string, string> = {
  todo: "قائمة",
  doing: "قيد التنفيذ",
  review: "للمراجعة",
  done: "مكتملة",
  active: "نشطة",
  ended: "منتهية",
  pending: "معلّقة",
};

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
    const offset = day === 6 ? 0 : day + 1;
    const start = new Date(y, m, d - offset);
    const end = new Date(y, m, d - offset + 6);
    return { from: iso(start), to: iso(end) };
  }
  if (period === "month") {
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return { from: iso(start), to: iso(end) };
  }
  return null;
};

const matchesStatus = (a: Appointment, status: string): boolean => {
  if (status === "all") return true;
  const completed = a.status === "done" || a.status === "ended";
  const overdue = a.date < todayStr() && !completed;
  if (status === "completed") return completed;
  if (status === "overdue") return overdue;
  if (status === "pending") return !completed && !overdue;
  return true;
};

const matchesScope = (a: Appointment, scope: string): boolean => {
  if (scope === "all") return true;
  if (scope === "ended") {
    return a.status === "done" || a.status === "ended" || a.date < todayStr();
  }
  return true;
};

export default function Appointments() {
  const { tasks } = useTasks();
  const { cases } = useCases();
  const [filters, setFilters] = useState<AppointmentFilters>(defaultFilters);

  const onFilterChange = (patch: Partial<AppointmentFilters>) =>
    setFilters((p) => ({ ...p, ...patch }));
  const onReset = () => setFilters(defaultFilters);

  const allAppointments = useMemo<Appointment[]>(() => {
    const list: Appointment[] = [];
    tasks.forEach((t) => {
      if (t.dueDate && !t.archived) list.push(taskToAppointment(t));
    });
    cases.forEach((c) => {
      if (c.startDate) list.push(caseToAppointment(c));
      // Each case session is also an appointment
      (c.sessions ?? []).forEach((s) => {
        if (!s.date) return;
        list.push({
          key: `session-${c.id}-${s.id}`,
          title: `جلسة: ${c.requestTitle || c.code}`,
          description: s.details || `${s.court ? s.court + " · " : ""}${
            s.mode === "online" ? "أون لاين" : "حضوري"
          }${s.location ? " · " + s.location : ""}`,
          date: s.date,
          time: s.time,
          type: "session",
          priority: c.priority,
          status: c.status,
          code: c.code,
          assignedTo: c.assignedLawyer,
        });
      });
    });
    return list.sort((a, b) => {
      const ad = a.date + (a.time ?? "");
      const bd = b.date + (b.time ?? "");
      return ad.localeCompare(bd);
    });
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
    link.download = `appointments-${todayStr()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();
  const hasActiveFilters =
    filters.search !== "" ||
    filters.lawyer !== "all" ||
    filters.status !== "all" ||
    filters.period !== "all" ||
    filters.type !== "all" ||
    filters.dateScope !== "all";

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
        {hasActiveFilters && <span className="text-amber-600">فلاتر مطبّقة</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-5">
          <EmptyState icon={CalendarX2} text="لا توجد مواعيد مطابقة للفلاتر" />
        </div>
      ) : filters.view === "table" ? (
        <TableView items={filtered} />
      ) : filters.view === "cards" ? (
        <CardsView items={filtered} />
      ) : filters.view === "timeline" ? (
        <TimelineView items={filtered} />
      ) : (
        <CalendarView items={filtered} />
      )}
    </div>
  );
}

// ============================================================
// Table View
// ============================================================

function TableView({ items }: { items: Appointment[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                التاريخ
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                النوع
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                العنوان
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                الأولوية
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                الكود
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const date = new Date(a.date);
              const dateLabel = date.toLocaleDateString("ar-EG-u-nu-latn", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const TypeIcon =
                a.type === "session" ? Gavel : a.type === "case" ? Briefcase : ListTodo;
              const typeColor =
                a.type === "session"
                  ? "bg-emerald-100 text-emerald-700"
                  : a.type === "case"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-violet-100 text-violet-700";
              const isPastDue =
                a.date < todayStr() && a.status !== "done" && a.status !== "ended";
              return (
                <tr
                  key={a.key}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    isPastDue ? "bg-rose-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-right text-slate-700">
                    <bdi dir="ltr">{dateLabel}</bdi>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${typeColor}`}
                    >
                      {a.type === "session" ? "جلسة" : a.type === "case" ? "قضية" : "مهمة"}
                      <TypeIcon className="w-3.5 h-3.5" />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 font-medium max-w-[260px] truncate">
                    {a.title}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-600">
                      {statusLabels[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        priorityColors[a.priority] ?? priorityColors.medium
                      }`}
                    >
                      {a.priority === "urgent" || a.priority === "critical" ? (
                        <AlertOctagon className="w-3 h-3" />
                      ) : null}
                      {priorityLabels[a.priority] ?? a.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono" dir="ltr">
                    {a.code}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Cards View
// ============================================================

function CardsView({ items }: { items: Appointment[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((a) => {
        const date = new Date(a.date);
        const dateLabel = date.toLocaleDateString("ar-EG-u-nu-latn", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        });
        const TypeIcon =
          a.type === "session" ? Gavel : a.type === "case" ? Briefcase : ListTodo;
        const typeColor =
          a.type === "session"
            ? "bg-emerald-100 text-emerald-700"
            : a.type === "case"
            ? "bg-sky-100 text-sky-700"
            : "bg-violet-100 text-violet-700";
        const isPastDue =
          a.date < todayStr() && a.status !== "done" && a.status !== "ended";
        return (
          <div
            key={a.key}
            className={`card p-4 hover:shadow-card-hover transition ${
              isPastDue ? "border-rose-200 bg-rose-50/30" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${typeColor}`}
              >
                {a.type === "session" ? "جلسة" : a.type === "case" ? "قضية" : "مهمة"}
                <TypeIcon className="w-3.5 h-3.5" />
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  priorityColors[a.priority] ?? priorityColors.medium
                }`}
              >
                {priorityLabels[a.priority] ?? a.priority}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-800 mb-1.5 text-right line-clamp-2">
              {a.title}
            </h4>

            {a.description && (
              <p className="text-xs text-slate-500 mb-3 text-right line-clamp-2">
                {a.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="font-mono text-slate-400" dir="ltr">
                {a.code}
              </span>
              <span className="text-slate-600 font-medium">
                <bdi dir="ltr">{dateLabel}</bdi>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Timeline View
// ============================================================

function TimelineView({ items }: { items: Appointment[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    items.forEach((a) => {
      const arr = map.get(a.date) ?? [];
      arr.push(a);
      map.set(a.date, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className="card p-5">
      <div className="space-y-6">
        {grouped.map(([date, group]) => {
          const d = new Date(date);
          const dateLabel = d.toLocaleDateString("ar-EG-u-nu-latn", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          const isToday = date === todayStr();
          const isPast = date < todayStr();
          return (
            <div key={date} className="relative">
              <div className="flex items-center justify-start gap-3 mb-3 sticky top-0 bg-white py-1 z-10">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    isToday
                      ? "bg-brand-100 text-brand-700"
                      : isPast
                      ? "bg-slate-100 text-slate-500"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {group.length} موعد
                </span>
                <h4 className="text-sm font-bold text-slate-700">
                  <bdi dir="ltr">{dateLabel}</bdi>
                  {isToday && <span className="text-brand-600 mr-2">• اليوم</span>}
                </h4>
              </div>
              <ul className="space-y-2 border-r-2 border-slate-200 pr-4 mr-2">
                {group.map((a) => {
                  const TypeIcon =
                    a.type === "session"
                      ? Gavel
                      : a.type === "case"
                      ? Briefcase
                      : ListTodo;
                  const typeColor =
                    a.type === "session"
                      ? "bg-emerald-100 text-emerald-700"
                      : a.type === "case"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-violet-100 text-violet-700";
                  return (
                    <li
                      key={a.key}
                      className="relative flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      <span
                        className="absolute -right-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-brand-400"
                      />
                      <div
                        className={`w-9 h-9 rounded-lg ${typeColor} flex items-center justify-center shrink-0`}
                      >
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          priorityColors[a.priority] ?? priorityColors.medium
                        }`}
                      >
                        {priorityLabels[a.priority] ?? a.priority}
                      </span>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-sm font-bold text-slate-700 truncate">
                          {a.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono" dir="ltr">
                          {a.code}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Calendar View
// ============================================================

function CalendarView({ items }: { items: Appointment[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    items.forEach((a) => {
      const arr = m.get(a.date) ?? [];
      arr.push(a);
      m.set(a.date, arr);
    });
    return m;
  }, [items]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Saturday start: 0=Sun … 6=Sat. We want Saturday as col 0.
  const firstDayWeek = firstDay.getDay();
  const startOffset = firstDayWeek === 6 ? 0 : firstDayWeek + 1;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const weekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const monthLabel = cursor.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));
  const today = () => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const tStr = todayStr();

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={today}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100"
          >
            اليوم
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-base font-bold text-slate-800">{monthLabel}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-bold text-slate-500 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalCells }).map((_, i) => {
          const dayNum = i - startOffset + 1;
          const inMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
          const cellDate = new Date(year, month, dayNum);
          const iso = inMonth ? cellDate.toISOString().slice(0, 10) : null;
          const events = iso ? byDate.get(iso) ?? [] : [];
          const isTodayCell = iso === tStr;
          return (
            <div
              key={i}
              className={`min-h-[88px] p-1.5 rounded-md border text-right ${
                inMonth
                  ? isTodayCell
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                  : "border-transparent bg-slate-50/50 text-slate-300"
              }`}
            >
              {inMonth && (
                <>
                  <div
                    className={`text-xs font-bold mb-1 ${
                      isTodayCell ? "text-brand-700" : "text-slate-600"
                    }`}
                  >
                    <bdi dir="ltr">{dayNum}</bdi>
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((e) => {
                      const color =
                        e.type === "case"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-violet-100 text-violet-700";
                      return (
                        <div
                          key={e.key}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${color}`}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className="text-[10px] text-slate-500 px-1.5">
                        + {events.length - 3} أخرى
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
