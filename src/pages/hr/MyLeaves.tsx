// My Leaves page — user submits leave/permission requests + sees history.

import { useMemo, useState } from "react";
import {
  CalendarRange,
  Plus,
  X,
  Save,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Hourglass,
  Trash2,
  Coins,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";
import {
  useMyLeaveRequests,
  useHrSettings,
  addLeaveRequest,
  cancelLeaveRequest,
  calcLeaveBalance,
  calcDays,
  calcHours,
  leaveTypeLabels,
  leaveStatusLabels,
  leaveStatusClasses,
  type LeaveType,
  type LeaveStatus,
} from "../../lib/leaveStore";
import { Field, Input, Textarea } from "../../components/ui/Field";
import InfoBanner from "../../components/ui/InfoBanner";

const fmtDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("ar-EG-u-nu-latn", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function MyLeavesPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { requests } = useMyLeaveRequests(staff?.id);
  const { settings } = useHrSettings();
  const [creating, setCreating] = useState(false);

  const balance = useMemo(
    () => calcLeaveBalance(requests, settings.annualLeaveDays),
    [requests, settings.annualLeaveDays]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<LeaveStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    requests.forEach((r) => counts[r.status]++);
    return counts;
  }, [requests]);

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={CalendarRange}
        title="إجازاتي واستئذاناتي"
        description="قدّم طلب إجازة أو استئذان. ستظل معلَّقة حتى يوافق عليها المدير. يمكنك إلغاء أي طلب لم تتم الموافقة عليه بعد."
      />

      {/* Balance + KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BalanceCard
          label="الرصيد المتاح"
          value={`${balance.remaining}`}
          sub={`من ${balance.total} يوم`}
          tone="emerald"
          icon={Coins}
        />
        <BalanceCard
          label="مستخدم"
          value={`${balance.used}`}
          sub="أيام مقبولة"
          tone="sky"
          icon={CheckCircle2}
        />
        <BalanceCard
          label="معلَّق"
          value={`${balance.pending}`}
          sub="بانتظار الموافقة"
          tone="amber"
          icon={Hourglass}
        />
        <BalanceCard
          label="مرفوض"
          value={`${statusCounts.rejected}`}
          sub="طلبات مرفوضة"
          tone="rose"
          icon={XCircle}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-4 h-4" />
            طلب جديد
          </button>
          <h2 className="text-lg font-extrabold text-slate-800">
            طلباتي ({requests.length})
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-300">
            <CalendarRange className="w-12 h-12 mb-3" strokeWidth={1.2} />
            <p className="text-sm font-bold text-slate-500 mb-1">
              لا توجد طلبات بعد
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
            >
              <Plus className="w-4 h-4" />
              تقديم الطلب الأول
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex-wrap"
              >
                {/* Cancel pending */}
                <div className="shrink-0">
                  {r.status === "pending" && (
                    <button
                      onClick={async () => {
                        if (!confirm("إلغاء هذا الطلب؟")) return;
                        await cancelLeaveRequest(r.id);
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition"
                      title="إلغاء الطلب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-end gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${leaveStatusClasses[r.status]}`}
                    >
                      {leaveStatusLabels[r.status]}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        r.type === "leave"
                          ? "bg-violet-100 text-violet-700"
                          : r.type === "delegation"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {r.type === "leave" ? (
                        <Calendar className="w-3 h-3" />
                      ) : r.type === "delegation" ? (
                        <Briefcase className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {leaveTypeLabels[r.type]}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {r.type === "permission"
                        ? `${r.hours?.toFixed(1)} ساعة`
                        : `${r.days} يوم`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {r.type === "permission" ? (
                      <span>
                        {fmtDate(r.startDate)} ·{" "}
                        <bdi dir="ltr">
                          {r.startTime} – {r.endTime}
                        </bdi>
                      </span>
                    ) : (
                      <span>
                        {fmtDate(r.startDate)}
                        {r.startDate !== r.endDate &&
                          ` → ${fmtDate(r.endDate)}`}
                      </span>
                    )}
                  </div>
                  {r.type === "delegation" && r.destination && (
                    <div className="flex items-center justify-end gap-1 text-[11px] text-amber-700 font-bold mt-1">
                      <span>{r.destination}</span>
                      <MapPin className="w-3 h-3" />
                    </div>
                  )}
                  {r.reason && (
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-5 line-clamp-2">
                      {r.reason}
                    </p>
                  )}
                  {r.status === "rejected" && r.rejectReason && (
                    <p className="text-[11px] text-rose-700 mt-1.5 leading-5 bg-rose-50 px-2 py-1 rounded">
                      <strong>سبب الرفض:</strong> {r.rejectReason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {creating && staff && (
        <NewLeaveModal
          userId={staff.id}
          onClose={() => setCreating(false)}
          remainingDays={balance.remaining}
        />
      )}
    </div>
  );
}

// ============================================================
// New request modal
// ============================================================

function NewLeaveModal({
  userId,
  onClose,
  remainingDays,
}: {
  userId: string;
  onClose: () => void;
  remainingDays: number;
}) {
  const [type, setType] = useState<LeaveType>("leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPermission = type === "permission";
  const isDelegation = type === "delegation";

  const days =
    !isPermission && startDate && endDate ? calcDays(startDate, endDate) : 0;
  const hours =
    isPermission && startTime && endTime
      ? calcHours(startTime, endTime)
      : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startDate) {
      setError("اختر تاريخ البداية");
      return;
    }
    if (!isPermission) {
      if (!endDate) {
        setError("اختر تاريخ النهاية");
        return;
      }
      if (startDate > endDate) {
        setError("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
        return;
      }
      // Only leaves consume balance — delegations don't.
      if (type === "leave" && days > remainingDays) {
        setError(
          `الأيام المطلوبة (${days}) تتجاوز رصيدك المتاح (${remainingDays})`
        );
        return;
      }
      if (isDelegation && !destination.trim()) {
        setError("أدخل وجهة الانتداب");
        return;
      }
    } else {
      if (!startTime || !endTime) {
        setError("اختر وقت البداية والنهاية");
        return;
      }
      if (startTime >= endTime) {
        setError("وقت البداية يجب أن يكون قبل وقت النهاية");
        return;
      }
    }
    setSaving(true);
    const result = await addLeaveRequest(userId, {
      type,
      startDate,
      endDate: isPermission ? startDate : endDate,
      startTime: isPermission ? startTime : null,
      endTime: isPermission ? endTime : null,
      reason,
      destination: isDelegation ? destination.trim() : "",
    });
    setSaving(false);
    if (result) onClose();
    else setError("تعذّر إرسال الطلب، حاول مجدداً");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={submit}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-800">طلب جديد</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Type toggle (3 options) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
                نوع الطلب
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType("leave")}
                  className={`inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border-2 text-xs font-bold transition ${
                    type === "leave"
                      ? "bg-violet-50 border-violet-500 text-violet-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  إجازة
                </button>
                <button
                  type="button"
                  onClick={() => setType("permission")}
                  className={`inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border-2 text-xs font-bold transition ${
                    type === "permission"
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  استئذان
                </button>
                <button
                  type="button"
                  onClick={() => setType("delegation")}
                  className={`inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border-2 text-xs font-bold transition ${
                    type === "delegation"
                      ? "bg-amber-50 border-amber-500 text-amber-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  انتداب
                </button>
              </div>
            </div>

            {type !== "permission" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="من تاريخ *">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (!endDate) setEndDate(e.target.value);
                      }}
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                  <Field label="إلى تاريخ *">
                    <Input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                </div>
                {isDelegation && (
                  <Field label="وجهة الانتداب *">
                    <Input
                      placeholder="مثال: محكمة الاستئناف بالرياض / مكتب الفرع / عميل..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </Field>
                )}
              </>
            ) : (
              <>
                <Field label="التاريخ *">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="من الساعة *">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                  <Field label="إلى الساعة *">
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      dir="ltr"
                      className="text-left"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* Live summary */}
            {(days > 0 || hours > 0) && (
              <div
                className={`p-3 rounded-lg border text-xs text-right ${
                  isDelegation
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-brand-50 border-brand-200 text-brand-800"
                }`}
              >
                {type === "leave" ? (
                  <>
                    سيتم خصم <strong>{days}</strong>{" "}
                    {days === 1 ? "يوم" : "أيام"} من رصيدك. الرصيد المتبقي بعد
                    القبول: <strong>{remainingDays - days}</strong>
                  </>
                ) : isDelegation ? (
                  <>
                    مدة الانتداب: <strong>{days}</strong>{" "}
                    {days === 1 ? "يوم" : "أيام"} — لا يُخصم من رصيد الإجازات
                  </>
                ) : (
                  <>
                    مدة الاستئذان: <strong>{hours.toFixed(1)}</strong> ساعة
                  </>
                )}
              </div>
            )}

            <Field label="السبب">
              <Textarea
                placeholder="وضح سبب الطلب باختصار..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "جارٍ الإرسال..." : "إرسال الطلب"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Balance card
// ============================================================

const balanceTones = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  sky: "bg-sky-50 border-sky-100 text-sky-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  rose: "bg-rose-50 border-rose-100 text-rose-700",
} as const;

function BalanceCard({
  label,
  value,
  sub,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone: keyof typeof balanceTones;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`rounded-xl border ${balanceTones[tone]} p-4 flex items-center gap-3`}
    >
      <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-[11px] font-bold opacity-90">{label}</div>
        <div className="text-2xl font-extrabold mt-0.5 leading-none">
          {value}
        </div>
        <div className="text-[10px] opacity-80 mt-1">{sub}</div>
      </div>
    </div>
  );
}
