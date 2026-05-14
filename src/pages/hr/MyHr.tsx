// MyHr — combined personal page for any staff member.
// Tabs:
//   • الحضور    (My check-in / check-out + history)
//   • الإجازات  (My leave/permission requests + balance)

import { useState } from "react";
import { Fingerprint, CalendarRange, User as UserIcon } from "lucide-react";
import MyAttendancePage from "./MyAttendance";
import MyLeavesPage from "./MyLeaves";

type TabKey = "attendance" | "leaves";

export default function MyHrPage() {
  const [active, setActive] = useState<TabKey>("attendance");

  const tabs: { key: TabKey; label: string; icon: typeof Fingerprint }[] = [
    { key: "attendance", label: "الحضور والانصراف", icon: Fingerprint },
    { key: "leaves", label: "الإجازات والاستئذانات", icon: CalendarRange },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1.5">
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
          بياناتي
          <UserIcon className="w-5 h-5 text-brand-500" />
        </h1>
      </div>

      {/* Active tab content */}
      <div>
        {active === "attendance" && <MyAttendancePage />}
        {active === "leaves" && <MyLeavesPage />}
      </div>
    </div>
  );
}
