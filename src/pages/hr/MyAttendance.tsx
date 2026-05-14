// My Attendance page — user's own check-in/check-out + history.
//
// Available to ANY logged-in staff member. Shows:
//   • Today's status (not checked in / checked in / checked out)
//   • Big check-in / check-out button (GPS-validated)
//   • Live distance to nearest assigned office
//   • History of past records (filterable by month)

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";
import { useLocations, useUserLocations } from "../../lib/locationStore";
import { useHolidays, getDayStatus } from "../../lib/holidayStore";
import {
  useMyAttendance,
  checkIn,
  checkOut,
  getCurrentPosition,
  findMatchingLocation,
  findNearestLocation,
  type GeoPosition,
} from "../../lib/attendanceStore";
import InfoBanner from "../../components/ui/InfoBanner";

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
  return `${h} س ${String(m).padStart(2, "0")} د`;
};

export default function MyAttendancePage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { locations } = useLocations();
  const { forUser } = useUserLocations();
  const { holidays } = useHolidays();
  const { records, today, refresh } = useMyAttendance(staff?.id);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [position, setPosition] = useState<GeoPosition | null>(null);

  // The user's assigned locations
  const myLocations = useMemo(() => {
    if (!staff?.id) return [];
    const ids = forUser(staff.id);
    return locations.filter((l) => ids.includes(l.id));
  }, [staff?.id, forUser, locations]);

  // Periodically refresh GPS position (every 30s) when the page is open.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const pos = await getCurrentPosition();
        if (!cancelled) setPosition(pos);
      } catch {
        // ignore — user might not have granted permission yet
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const todayStatus = useMemo(() => {
    if (myLocations.length === 0) return null;
    // Use any location to get today's day status (weekly off / holiday)
    return getDayStatus(new Date(), myLocations[0], holidays);
  }, [myLocations, holidays]);

  const nearest = useMemo(() => {
    if (!position || myLocations.length === 0) return null;
    return findNearestLocation(position, myLocations);
  }, [position, myLocations]);

  const matching = useMemo(() => {
    if (!position || myLocations.length === 0) return null;
    return findMatchingLocation(position, myLocations);
  }, [position, myLocations]);

  const handleCheckIn = async () => {
    if (!staff?.id) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await checkIn({
      userId: staff.id,
      myLocations,
      holidays,
      position: position ?? undefined,
    });
    setBusy(false);
    if (result.ok) {
      setSuccess("تم تسجيل حضورك بنجاح");
      refresh();
    } else {
      setError(result.error);
    }
  };

  const handleCheckOut = async () => {
    if (!staff?.id) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await checkOut({
      userId: staff.id,
      myLocations,
      position: position ?? undefined,
    });
    setBusy(false);
    if (result.ok) {
      setSuccess("تم تسجيل انصرافك بنجاح");
      refresh();
    } else {
      setError(result.error);
    }
  };

  if (!staff) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-3" />
        <p className="text-sm text-slate-500">جارٍ تحميل بياناتك...</p>
      </div>
    );
  }

  if (myLocations.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Building2 className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700 mb-1">
          لم يتم تعيين موقع لك
        </h2>
        <p className="text-sm text-slate-500">
          يرجى مراجعة المدير لتعيين موقع المكتب الخاص بك حتى تستطيع تسجيل
          حضورك.
        </p>
      </div>
    );
  }

  const canCheckIn = !today && (!todayStatus || todayStatus.kind === "work");
  const canCheckOut = !!today && !today.checkOutAt;
  const finished = !!today?.checkOutAt;

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Clock}
        title="حضوري"
        description="سجّل حضورك وانصرافك من موقع المكتب. يتم التحقق من موقعك جغرافياً قبل قبول التسجيل."
      />

      {/* Today's card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
          {todayStatus?.kind === "off" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <Calendar className="w-3.5 h-3.5" />
              {todayStatus.reason === "holiday"
                ? `إجازة رسمية: ${todayStatus.holiday?.name ?? ""}`
                : "إجازة أسبوعية"}
            </span>
          ) : finished ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              مكتمل
            </span>
          ) : today ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
              <LogIn className="w-3.5 h-3.5" />
              حاضر
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
              لم تُسجّل حضورك بعد
            </span>
          )}
          <div className="text-right">
            <h2 className="text-lg font-extrabold text-slate-800">اليوم</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString("ar-EG-u-nu-latn", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Status pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <StatBox
            label="الحضور"
            value={fmtTime(today?.checkInAt ?? null)}
            icon={LogIn}
            tone={today ? "emerald" : "slate"}
            sub={
              today?.checkInDistanceM != null
                ? `${today.checkInDistanceM}م`
                : undefined
            }
          />
          <StatBox
            label="الانصراف"
            value={fmtTime(today?.checkOutAt ?? null)}
            icon={LogOut}
            tone={today?.checkOutAt ? "emerald" : "slate"}
            sub={
              today?.checkOutDistanceM != null
                ? `${today.checkOutDistanceM}م`
                : undefined
            }
          />
          <StatBox
            label="مدة العمل"
            value={
              today ? formatDuration(today.checkInAt, today.checkOutAt) : "—"
            }
            icon={Clock}
            tone="sky"
          />
        </div>

        {/* GPS status */}
        {position && nearest && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-xs mb-3 border ${
              matching
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <div className="flex-1 text-right">
              {matching ? (
                <>
                  أنت داخل نطاق <strong>{matching.location.name}</strong>
                  {" "}({matching.distanceM}م من {matching.location.radiusM}م مسموح)
                </>
              ) : (
                <>
                  تبعد عن أقرب مكتب <strong>{nearest.location.name}</strong>
                  {" "}بمسافة {nearest.distanceM}م
                  {" "}(يجب أن تكون داخل {nearest.location.radiusM}م)
                </>
              )}
            </div>
          </div>
        )}

        {!position && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-xs mb-3 bg-slate-50 text-slate-600 border border-slate-200">
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            جارٍ تحديد موقعك...
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 flex-wrap">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={busy}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              تسجيل حضور
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={busy}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-rose-600 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              تسجيل انصراف
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 text-right">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-right">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="flex-1 font-bold">{success}</span>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card p-5">
        <h3 className="text-base font-extrabold text-slate-800 mb-4 pb-3 border-b border-slate-100 text-right">
          سجل الحضور ({records.length})
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            لا توجد سجلات حضور بعد
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {records.slice(0, 30).map((r) => {
              const loc = locations.find((l) => l.id === r.locationId);
              const isLate = r.status === "late";
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 py-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm font-bold text-slate-800">
                        {fmtDate(r.date)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {loc?.name ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isLate && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                        متأخر
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      <LogIn className="w-3 h-3" />
                      <bdi dir="ltr">{fmtTime(r.checkInAt)}</bdi>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                      <LogOut className="w-3 h-3" />
                      <bdi dir="ltr">{fmtTime(r.checkOutAt)}</bdi>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">
                      <Clock className="w-3 h-3" />
                      {formatDuration(r.checkInAt, r.checkOutAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "slate" | "sky";
  sub?: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    slate: "bg-slate-50 border-slate-200 text-slate-500",
    sky: "bg-sky-50 border-sky-100 text-sky-700",
  } as const;
  const t = tones[tone];
  return (
    <div className={`rounded-xl border ${t} p-3 flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-[10px] font-bold opacity-80">{label}</div>
        <div className="text-base font-extrabold mt-0.5" dir="ltr">
          {value}
        </div>
        {sub && <div className="text-[10px] opacity-70 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
