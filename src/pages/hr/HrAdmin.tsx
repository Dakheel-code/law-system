// HR Admin — single manager-only page that combines all admin tabs:
//   • التقارير     (Attendance Reports)
//   • الموافقات    (Leave Approvals)
//   • المواقع      (Office Locations)
//   • الإجازات     (Holidays)
//
// Replaces 4 separate pages to keep the sidebar lean.

import { useState } from "react";
import {
  BarChart3,
  CheckCheck,
  MapPin,
  CalendarOff,
  Lock,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";
import LocationsPage from "./Locations";
import HolidaysPage from "./Holidays";
import LeaveApprovalsPage from "./LeaveApprovals";
import AttendanceReportsPage from "./AttendanceReports";

type TabKey = "reports" | "approvals" | "locations" | "holidays";

export default function HrAdminPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const [active, setActive] = useState<TabKey>("reports");

  const isManager = staff?.type === "manager";

  if (!isManager) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700">ليس لديك صلاحية</h2>
        <p className="text-sm text-slate-500 mt-1">
          هذه الصفحة متاحة للمستخدمين من نوع "مدير" فقط.
        </p>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
    { key: "reports", label: "تقارير الحضور", icon: BarChart3 },
    { key: "approvals", label: "موافقات الإجازات", icon: CheckCheck },
    { key: "locations", label: "مواقع المكاتب", icon: MapPin },
    { key: "holidays", label: "الإجازات الرسمية", icon: CalendarOff },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1.5 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-brand-500 text-white shadow"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          إدارة الموارد البشرية
          <SettingsIcon className="w-5 h-5 text-brand-500" />
        </h1>
      </div>

      {/* Active tab content */}
      <div>
        {active === "reports" && <AttendanceReportsPage />}
        {active === "approvals" && <LeaveApprovalsPage />}
        {active === "locations" && <LocationsPage />}
        {active === "holidays" && <HolidaysPage />}
      </div>
    </div>
  );
}
