// Admin attendance reports (Phase 5 — final phase).
//
// Manager-only page with 3 views:
//   • يومي (Daily)    — جدول حضور لكل مستخدم لتاريخ واحد
//   • شهري (Monthly)  — ملخص شهر (أيام عمل، أيام حضور، تأخّر، غياب، إجازات)
//   • سنوي (Yearly)   — ملخص 12 شهر لكل مستخدم
//
// Filters: user, location, status, date range.
// Export: CSV download.

import { useMemo, useState } from "react";
import {
  BarChart3,
  Lock,
  Download,
  Calendar,
  LayoutGrid,
  CalendarRange,
  Users as UsersIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff, useUsers } from "../../lib/userStore";
import { useLocations, weekDayOf } from "../../lib/locationStore";
import { useHolidays, getDayStatus } from "../../lib/holidayStore";
import { useAllAttendance } from "../../lib/attendanceStore";
import { useAllLeaveRequests } from "../../lib/leaveStore";
import { toLocalISO } from "../../lib/hijri";
import InfoBanner from "../../components/ui/InfoBanner";

type ViewMode = "daily" | "monthly" | "yearly";

const fmtTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("ar-EG-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("ar-EG-u-nu-latn", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatDuration = (from: string, to: string | null): string => {
  if (!to) return "—";
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms <= 0) return "—";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
};

// Compute total minutes between two timestamps; 0 if missing.
const durationMin = (from: string, to: string | null): number => {
  if (!to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.floor(ms / 60000));
};

const arabicMonths = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export default function AttendanceReportsPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { users } = useUsers();
  const { locations } = useLocations();
  const { holidays } = useHolidays();
  const { requests: leaveRequests } = useAllLeaveRequests();

  const isManager = staff?.type === "manager";

  const [view, setView] = useState<ViewMode>("daily");
  const [dayDate, setDayDate] = useState(toLocalISO(new Date()));
  const [monthStr, setMonthStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [userFilter, setUserFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Date range for the attendance query — derive from current view
  const { fromDate, toDate } = useMemo(() => {
    if (view === "daily") return { fromDate: dayDate, toDate: dayDate };
    if (view === "monthly") {
      const [y, m] = monthStr.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      return {
        fromDate: `${monthStr}-01`,
        toDate: `${monthStr}-${String(last).padStart(2, "0")}`,
      };
    }
    // yearly
    return {
      fromDate: `${year}-01-01`,
      toDate: `${year}-12-31`,
    };
  }, [view, dayDate, monthStr, year]);

  const { records, loading } = useAllAttendance(fromDate, toDate);

  // Active users only (for filter dropdowns)
  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "active"),
    [users]
  );

  // Apply user/location filters to records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (userFilter !== "all" && r.userId !== userFilter) return false;
      if (locationFilter !== "all" && r.locationId !== locationFilter)
        return false;
      return true;
    });
  }, [records, userFilter, locationFilter]);

  if (!isManager) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700">ليس لديك صلاحية</h2>
        <p className="text-sm text-slate-500 mt-1">
          تقارير الحضور متاحة للمستخدمين من نوع "مدير" فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={BarChart3}
        title="تقارير الحضور"
        description="سجل شامل لحضور الموظفين بثلاث طرق عرض: يومي، شهري، وسنوي. مع فلاتر متعددة وإمكانية التصدير."
      />

      {/* View switcher + filters */}
      <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {[
            { key: "daily", label: "يومي", icon: Calendar },
            { key: "monthly", label: "شهري", icon: LayoutGrid },
            { key: "yearly", label: "سنوي", icon: CalendarRange },
          ].map((v) => {
            const Icon = v.icon;
            const active = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key as ViewMode)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition ${
                  active
                    ? "bg-brand-500 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Date selector — varies by view */}
        {view === "daily" && (
          <input
            type="date"
            value={dayDate}
            onChange={(e) => setDayDate(e.target.value)}
            dir="ltr"
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        )}
        {view === "monthly" && (
          <input
            type="month"
            value={monthStr}
            onChange={(e) => setMonthStr(e.target.value)}
            dir="ltr"
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        )}
        {view === "yearly" && (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        )}

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="all">كل المستخدمين</option>
          {activeUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName || u.code}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="all">كل المواقع</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card p-16 text-center text-sm text-slate-400">
          جارٍ التحميل...
        </div>
      ) : view === "daily" ? (
        <DailyView
          date={dayDate}
          records={filteredRecords}
          users={userFilter === "all" ? activeUsers : activeUsers.filter((u) => u.id === userFilter)}
          locations={locations}
          holidays={holidays}
          leaveRequests={leaveRequests}
          locationFilter={locationFilter}
        />
      ) : view === "monthly" ? (
        <MonthlyView
          monthStr={monthStr}
          records={filteredRecords}
          users={userFilter === "all" ? activeUsers : activeUsers.filter((u) => u.id === userFilter)}
          locations={locations}
          holidays={holidays}
          leaveRequests={leaveRequests}
          locationFilter={locationFilter}
        />
      ) : (
        <YearlyView
          year={year}
          records={filteredRecords}
          users={userFilter === "all" ? activeUsers : activeUsers.filter((u) => u.id === userFilter)}
        />
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

type LiteUser = {
  id: string;
  fullName: string;
  code: string;
  type: string;
  email: string;
  avatarDataUrl: string | null;
  firstName: string;
};

function downloadCSV(filename: string, rows: (string | number)[][]) {
  // BOM so Excel detects UTF-8 with Arabic text
  const csv =
    "﻿" +
    rows
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n"))
              return `"${s.replace(/"/g, '""')}"`;
            return s;
          })
          .join(",")
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// Daily view — one row per user
// ============================================================

import type { AttendanceRecord } from "../../lib/attendanceStore";
import type { OfficeLocation } from "../../lib/locationStore";
import type { Holiday } from "../../lib/holidayStore";
import type { LeaveRequest } from "../../lib/leaveStore";

function isOnLeave(
  userId: string,
  isoDate: string,
  leaves: LeaveRequest[]
): LeaveRequest | null {
  return (
    leaves.find(
      (l) =>
        l.userId === userId &&
        l.status === "approved" &&
        isoDate >= l.startDate &&
        isoDate <= l.endDate
    ) ?? null
  );
}

function DailyView({
  date,
  records,
  users,
  locations,
  holidays,
  leaveRequests,
  locationFilter,
}: {
  date: string;
  records: AttendanceRecord[];
  users: LiteUser[];
  locations: OfficeLocation[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
  locationFilter: string;
}) {
  const dateObj = new Date(date + "T00:00:00");
  // Use the first location (or filtered location) for day-status check
  const refLocation =
    locations.find((l) => l.id === locationFilter) || locations[0];
  const dayStatus = refLocation
    ? getDayStatus(dateObj, refLocation, holidays)
    : null;
  const isOffDay = dayStatus?.kind === "off";

  // Build per-user rows
  const rows = useMemo(() => {
    const recordByUser = new Map<string, AttendanceRecord>();
    records.forEach((r) => recordByUser.set(r.userId, r));
    return users.map((u) => {
      const r = recordByUser.get(u.id);
      const leave = !r ? isOnLeave(u.id, date, leaveRequests) : null;
      const status: string = r
        ? r.status === "late"
          ? "late"
          : "present"
        : leave
        ? "leave"
        : isOffDay
        ? "off"
        : "absent";
      return { user: u, record: r, leave, status };
    });
  }, [users, records, date, leaveRequests, isOffDay]);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, leave: 0, off: 0 };
    rows.forEach((row) => {
      c[row.status as keyof typeof c]++;
    });
    return c;
  }, [rows]);

  const handleExport = () => {
    const headers = [
      "الموظف",
      "الكود",
      "الموقع",
      "الحضور",
      "الانصراف",
      "المدة",
      "المسافة (م)",
      "الحالة",
    ];
    const csvRows = rows.map((row) => {
      const loc = row.record
        ? locations.find((l) => l.id === row.record!.locationId)
        : null;
      return [
        row.user.fullName || row.user.code,
        row.user.code,
        loc?.name ?? "—",
        row.record ? fmtTime(row.record.checkInAt) : "—",
        row.record ? fmtTime(row.record.checkOutAt) : "—",
        row.record
          ? formatDuration(row.record.checkInAt, row.record.checkOutAt)
          : "—",
        row.record?.checkInDistanceM ?? "—",
        statusLabel(row.status),
      ];
    });
    downloadCSV(`attendance-${date}.csv`, [headers, ...csvRows]);
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="حاضر" value={counts.present} tone="emerald" icon={CheckCircle2} />
        <KPI label="متأخر" value={counts.late} tone="amber" icon={AlertCircle} />
        <KPI label="غائب" value={counts.absent} tone="rose" icon={XCircle} />
        <KPI label="إجازة" value={counts.leave} tone="violet" icon={CalendarDays} />
        <KPI label="إجازة رسمية" value={counts.off} tone="slate" icon={Calendar} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </button>
          <div className="text-right">
            <h3 className="text-base font-extrabold text-slate-800">
              {fmtDate(date)}
            </h3>
            {isOffDay && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                {dayStatus.reason === "holiday"
                  ? `إجازة رسمية: ${dayStatus.holiday?.name ?? ""}`
                  : "إجازة أسبوعية"}
              </span>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-10">
            لا يوجد مستخدمون
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 text-right font-bold">الموظف</th>
                  <th className="py-2 px-2 text-right font-bold">الموقع</th>
                  <th className="py-2 px-2 text-center font-bold">الحضور</th>
                  <th className="py-2 px-2 text-center font-bold">الانصراف</th>
                  <th className="py-2 px-2 text-center font-bold">المدة</th>
                  <th className="py-2 px-2 text-center font-bold">المسافة</th>
                  <th className="py-2 px-2 text-center font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const loc = row.record
                    ? locations.find((l) => l.id === row.record!.locationId)
                    : null;
                  return (
                    <tr
                      key={row.user.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {row.user.avatarDataUrl ? (
                            <img
                              src={row.user.avatarDataUrl}
                              alt={row.user.fullName}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {(
                                row.user.firstName?.[0] ||
                                row.user.fullName?.[0] ||
                                "؟"
                              ).toUpperCase()}
                            </div>
                          )}
                          <div className="text-right min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">
                              {row.user.fullName || row.user.code}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono" dir="ltr">
                              {row.user.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-slate-600">
                        {loc?.name ?? "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs" dir="ltr">
                        {row.record ? fmtTime(row.record.checkInAt) : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs" dir="ltr">
                        {row.record ? fmtTime(row.record.checkOutAt) : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-sky-700">
                        {row.record
                          ? formatDuration(
                              row.record.checkInAt,
                              row.record.checkOutAt
                            )
                          : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-500">
                        {row.record?.checkInDistanceM != null
                          ? `${row.record.checkInDistanceM}م`
                          : "—"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <StatusBadge
                          status={row.status}
                          leaveName={
                            row.status === "leave"
                              ? row.leave?.type === "leave"
                                ? "إجازة"
                                : "استئذان"
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Monthly view — per-user summary
// ============================================================

function MonthlyView({
  monthStr,
  records,
  users,
  locations,
  holidays,
  leaveRequests,
  locationFilter,
}: {
  monthStr: string;
  records: AttendanceRecord[];
  users: LiteUser[];
  locations: OfficeLocation[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
  locationFilter: string;
}) {
  const [y, m] = monthStr.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const refLocation =
    locations.find((l) => l.id === locationFilter) || locations[0];

  // Per user: working days, present, late, absent, leave, hours
  const summaries = useMemo(() => {
    return users.map((u) => {
      let workingDays = 0;
      let present = 0;
      let late = 0;
      let absent = 0;
      let leaveDays = 0;
      let totalMinutes = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const isoDate = `${monthStr}-${String(d).padStart(2, "0")}`;
        const dateObj = new Date(y, m - 1, d);
        const status = refLocation
          ? getDayStatus(dateObj, refLocation, holidays)
          : null;
        if (!status || status.kind === "off") continue;
        workingDays++;
        const rec = records.find(
          (r) => r.userId === u.id && r.date === isoDate
        );
        if (rec) {
          if (rec.status === "late") late++;
          else present++;
          totalMinutes += durationMin(rec.checkInAt, rec.checkOutAt);
        } else if (isOnLeave(u.id, isoDate, leaveRequests)) {
          leaveDays++;
        } else if (dateObj <= new Date()) {
          absent++;
        }
      }
      return {
        user: u,
        workingDays,
        present,
        late,
        absent,
        leaveDays,
        totalMinutes,
      };
    });
  }, [
    users,
    daysInMonth,
    monthStr,
    y,
    m,
    refLocation,
    holidays,
    records,
    leaveRequests,
  ]);

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, s) => ({
        present: acc.present + s.present + s.late,
        late: acc.late + s.late,
        absent: acc.absent + s.absent,
        leave: acc.leave + s.leaveDays,
        totalMin: acc.totalMin + s.totalMinutes,
      }),
      { present: 0, late: 0, absent: 0, leave: 0, totalMin: 0 }
    );
  }, [summaries]);

  const handleExport = () => {
    const headers = [
      "الموظف",
      "الكود",
      "أيام العمل",
      "حضور",
      "تأخر",
      "غياب",
      "إجازات",
      "إجمالي الساعات",
    ];
    const csvRows = summaries.map((s) => [
      s.user.fullName || s.user.code,
      s.user.code,
      s.workingDays,
      s.present,
      s.late,
      s.absent,
      s.leaveDays,
      (s.totalMinutes / 60).toFixed(1),
    ]);
    downloadCSV(`attendance-${monthStr}.csv`, [headers, ...csvRows]);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="إجمالي الحضور" value={totals.present} tone="emerald" icon={LogIn} />
        <KPI label="تأخر" value={totals.late} tone="amber" icon={AlertCircle} />
        <KPI label="غياب" value={totals.absent} tone="rose" icon={XCircle} />
        <KPI label="إجازات" value={totals.leave} tone="violet" icon={CalendarDays} />
        <KPI
          label="ساعات العمل"
          value={Math.round(totals.totalMin / 60)}
          tone="sky"
          icon={Clock}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </button>
          <h3 className="text-base font-extrabold text-slate-800">
            ملخص شهر {arabicMonths[m - 1]} {y}
          </h3>
        </div>

        {summaries.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-10">
            لا يوجد مستخدمون
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 text-right font-bold">الموظف</th>
                  <th className="py-2 px-2 text-center font-bold">أيام العمل</th>
                  <th className="py-2 px-2 text-center font-bold">حضور</th>
                  <th className="py-2 px-2 text-center font-bold">تأخر</th>
                  <th className="py-2 px-2 text-center font-bold">غياب</th>
                  <th className="py-2 px-2 text-center font-bold">إجازات</th>
                  <th className="py-2 px-2 text-center font-bold">إجمالي الساعات</th>
                  <th className="py-2 px-2 text-center font-bold">نسبة الحضور</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => {
                  const pct =
                    s.workingDays > 0
                      ? ((s.present + s.late) / s.workingDays) * 100
                      : 0;
                  return (
                    <tr
                      key={s.user.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {s.user.avatarDataUrl ? (
                            <img
                              src={s.user.avatarDataUrl}
                              alt={s.user.fullName}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {(
                                s.user.firstName?.[0] ||
                                s.user.fullName?.[0] ||
                                "؟"
                              ).toUpperCase()}
                            </div>
                          )}
                          <div className="text-right min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">
                              {s.user.fullName || s.user.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-slate-700">
                        {s.workingDays}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-emerald-700 font-bold">
                        {s.present + s.late}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-amber-700">
                        {s.late}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-rose-700">
                        {s.absent}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-violet-700">
                        {s.leaveDays}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-xs text-sky-700" dir="ltr">
                        {(s.totalMinutes / 60).toFixed(1)} س
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`text-xs font-bold ${
                              pct >= 90
                                ? "text-emerald-700"
                                : pct >= 70
                                ? "text-amber-700"
                                : "text-rose-700"
                            }`}
                          >
                            {pct.toFixed(0)}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 90
                                  ? "bg-emerald-500"
                                  : pct >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Yearly view — per-user 12-month grid
// ============================================================

function YearlyView({
  year,
  records,
  users,
}: {
  year: number;
  records: AttendanceRecord[];
  users: LiteUser[];
}) {
  // Per user, per month: count attended days
  const matrix = useMemo(() => {
    return users.map((u) => {
      const months: number[] = Array(12).fill(0);
      const hours: number[] = Array(12).fill(0);
      records.forEach((r) => {
        if (r.userId !== u.id) return;
        const d = new Date(r.date + "T00:00:00");
        if (d.getFullYear() !== year) return;
        months[d.getMonth()]++;
        hours[d.getMonth()] += durationMin(r.checkInAt, r.checkOutAt);
      });
      const totalDays = months.reduce((a, b) => a + b, 0);
      const totalHours = hours.reduce((a, b) => a + b, 0) / 60;
      return { user: u, months, hours, totalDays, totalHours };
    });
  }, [users, records, year]);

  const handleExport = () => {
    const headers = ["الموظف", "الكود", ...arabicMonths, "إجمالي الأيام", "إجمالي الساعات"];
    const csvRows = matrix.map((m) => [
      m.user.fullName || m.user.code,
      m.user.code,
      ...m.months,
      m.totalDays,
      m.totalHours.toFixed(1),
    ]);
    downloadCSV(`attendance-${year}.csv`, [headers, ...csvRows]);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          تصدير CSV
        </button>
        <h3 className="text-base font-extrabold text-slate-800">
          ملخص سنة {year}
        </h3>
      </div>

      {matrix.length === 0 ? (
        <div className="text-center text-sm text-slate-400 py-10">
          لا يوجد مستخدمون
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-slate-200">
                <th className="py-2 px-2 text-right font-bold sticky right-0 bg-white">
                  الموظف
                </th>
                {arabicMonths.map((label) => (
                  <th
                    key={label}
                    className="py-2 px-1 text-center font-bold min-w-[44px]"
                  >
                    {label}
                  </th>
                ))}
                <th className="py-2 px-2 text-center font-bold">إجمالي</th>
                <th className="py-2 px-2 text-center font-bold">الساعات</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m) => (
                <tr
                  key={m.user.id}
                  className="border-b border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="py-2 px-2 sticky right-0 bg-white hover:bg-slate-50/60">
                    <div className="flex items-center gap-2">
                      {m.user.avatarDataUrl ? (
                        <img
                          src={m.user.avatarDataUrl}
                          alt={m.user.fullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(
                            m.user.firstName?.[0] ||
                            m.user.fullName?.[0] ||
                            "؟"
                          ).toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {m.user.fullName || m.user.code}
                      </div>
                    </div>
                  </td>
                  {m.months.map((n, i) => (
                    <td
                      key={i}
                      className={`py-2 px-1 text-center font-mono text-xs ${
                        n > 0 ? "text-slate-800 font-bold" : "text-slate-300"
                      }`}
                    >
                      {n || "—"}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center font-mono text-xs text-emerald-700 font-extrabold">
                    {m.totalDays}
                  </td>
                  <td
                    className="py-2 px-2 text-center font-mono text-xs text-sky-700"
                    dir="ltr"
                  >
                    {m.totalHours.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Shared UI helpers
// ============================================================

const kpiTones = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  rose: "bg-rose-50 border-rose-100 text-rose-700",
  violet: "bg-violet-50 border-violet-100 text-violet-700",
  sky: "bg-sky-50 border-sky-100 text-sky-700",
  slate: "bg-slate-50 border-slate-200 text-slate-700",
} as const;

function KPI({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: keyof typeof kpiTones;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className={`rounded-xl border ${kpiTones[tone]} p-3 flex items-center gap-3`}>
      <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-[10px] font-bold opacity-90">{label}</div>
        <div className="text-2xl font-extrabold mt-0.5 leading-none">{value}</div>
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  return (
    {
      present: "حاضر",
      late: "متأخر",
      absent: "غائب",
      leave: "إجازة",
      off: "إجازة رسمية",
    }[status] ?? status
  );
}

function StatusBadge({
  status,
  leaveName,
}: {
  status: string;
  leaveName?: string;
}) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    present: {
      label: "حاضر",
      cls: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    late: {
      label: "متأخر",
      cls: "bg-amber-100 text-amber-700",
      icon: AlertCircle,
    },
    absent: { label: "غائب", cls: "bg-rose-100 text-rose-700", icon: XCircle },
    leave: {
      label: leaveName ?? "إجازة",
      cls: "bg-violet-100 text-violet-700",
      icon: CalendarDays,
    },
    off: {
      label: "إجازة رسمية",
      cls: "bg-slate-200 text-slate-700",
      icon: Calendar,
    },
  };
  const m = map[status] ?? map.absent;
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${m.cls}`}
    >
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}
