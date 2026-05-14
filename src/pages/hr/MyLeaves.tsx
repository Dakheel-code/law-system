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
  Paperclip,
  Upload,
  ExternalLink,
  FileText,
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
  addLeaveAttachments,
  leaveTypeLabels,
  leaveStatusLabels,
  leaveStatusClasses,
  leaveCategoryLabels,
  leaveCategoryClasses,
  leaveCategoryConsumesBalance,
  type LeaveType,
  type LeaveStatus,
  type LeaveCategory,
} from "../../lib/leaveStore";
import { uploadEntityFile } from "../../lib/drive";
import { useCases } from "../../lib/caseStore";
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
                    {r.type === "leave" && r.category !== "annual" && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${leaveCategoryClasses[r.category]}`}
                      >
                        {leaveCategoryLabels[r.category]}
                      </span>
                    )}
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
                  {r.attachments.length > 0 && (
                    <div className="flex items-center justify-end gap-1.5 mt-1.5 flex-wrap">
                      {r.attachments.map((a, idx) =>
                        a.webViewLink ? (
                          <a
                            key={idx}
                            href={a.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                            title={a.name}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {a.name.slice(0, 24)}
                            {a.name.length > 24 ? "..." : ""}
                          </a>
                        ) : (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            {a.name.slice(0, 24)}
                          </span>
                        )
                      )}
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
  const [category, setCategory] = useState<LeaveCategory>("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPermission = type === "permission";
  const isDelegation = type === "delegation";
  const isLeave = type === "leave";
  const consumesBalance = isLeave && leaveCategoryConsumesBalance[category];

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
      // Only categories that consume balance need to fit within it.
      if (consumesBalance && days > remainingDays) {
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
      category: isLeave ? category : undefined,
      startDate,
      endDate: isPermission ? startDate : endDate,
      startTime: isPermission ? startTime : null,
      endTime: isPermission ? endTime : null,
      reason,
      destination: isDelegation ? destination.trim() : "",
      caseId: isDelegation ? caseId : null,
      sessionId: isDelegation ? sessionId : null,
    });

    // Upload pending attachments if any
    if (result && pendingFiles.length > 0) {
      try {
        const folderName = `${leaveTypeLabels[type]}${isLeave ? ` (${leaveCategoryLabels[category]})` : ""} - ${startDate}`;
        const uploaded: import("../../lib/clientStore").AttachmentRecord[] = [];
        for (const f of pendingFiles) {
          const df = await uploadEntityFile(
            "leave",
            result.id,
            folderName,
            f
          );
          uploaded.push({
            name: f.name,
            size: f.size,
            type: f.type,
            driveFileId: df.id,
            webViewLink: df.webViewLink,
            iconLink: df.iconLink,
            thumbnailLink: df.thumbnailLink,
            uploadedAt: new Date().toISOString(),
          });
        }
        if (uploaded.length > 0)
          await addLeaveAttachments(result.id, uploaded);
      } catch (err) {
        // Non-fatal — the request was already created
        console.error("leave attachment upload failed:", err);
      }
    }

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

            {/* Leave category — only when type='leave' */}
            {isLeave && (
              <Field label="نوع الإجازة">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LeaveCategory)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 text-right"
                >
                  {(Object.keys(leaveCategoryLabels) as LeaveCategory[]).map(
                    (k) => (
                      <option key={k} value={k}>
                        {leaveCategoryLabels[k]}
                        {!leaveCategoryConsumesBalance[k]
                          ? " (لا تُخصم)"
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </Field>
            )}

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
                  <DelegationCaseFields
                    caseId={caseId}
                    sessionId={sessionId}
                    destination={destination}
                    onCaseChange={(cid) => {
                      setCaseId(cid);
                      setSessionId(null);
                    }}
                    onSessionPick={(sid, court, date) => {
                      setSessionId(sid);
                      if (court) setDestination(court);
                      if (date) {
                        setStartDate(date);
                        if (!endDate) setEndDate(date);
                      }
                    }}
                    onDestinationChange={setDestination}
                  />
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
                    : !consumesBalance && isLeave
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-brand-50 border-brand-200 text-brand-800"
                }`}
              >
                {isLeave ? (
                  consumesBalance ? (
                    <>
                      سيتم خصم <strong>{days}</strong>{" "}
                      {days === 1 ? "يوم" : "أيام"} من رصيدك. الرصيد المتبقي
                      بعد القبول: <strong>{remainingDays - days}</strong>
                    </>
                  ) : (
                    <>
                      مدة الإجازة: <strong>{days}</strong>{" "}
                      {days === 1 ? "يوم" : "أيام"} —{" "}
                      <strong>{leaveCategoryLabels[category]}</strong> لا تُخصم
                      من رصيد الإجازات السنوي
                    </>
                  )
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

            {/* Attachments uploader */}
            <PendingFilesPicker
                value={pendingFiles}
                onChange={setPendingFiles}
                hint={
                  isLeave && category === "sick"
                    ? "أرفق التقرير الطبي"
                    : "مرفقات اختيارية (تذكرة، تقرير، صورة إثبات...)"
                }
              />

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

// ============================================================
// PendingFilesPicker — collects File[] before submission
// ============================================================

function PendingFilesPicker({
  value,
  onChange,
  hint,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  hint: string;
}) {
  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    onChange([...value, ...files]);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        المرفقات
      </label>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3">
        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold hover:bg-brand-100 cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          إضافة ملفات
          <input
            type="file"
            multiple
            onChange={handlePick}
            className="hidden"
          />
        </label>
        <span className="text-[10px] text-slate-500 mr-3">{hint}</span>

        {value.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {value.map((f, idx) => (
              <li
                key={`${f.name}-${idx}`}
                className="flex items-center justify-between gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChange(value.filter((_, i) => i !== idx))
                  }
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                  title="إزالة"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="flex-1 min-w-0 text-right">
                  <div className="font-bold text-slate-700 truncate">
                    {f.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(f.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DelegationCaseFields — case + session picker that auto-fills destination
// ============================================================

function DelegationCaseFields({
  caseId,
  sessionId,
  destination,
  onCaseChange,
  onSessionPick,
  onDestinationChange,
}: {
  caseId: string | null;
  sessionId: string | null;
  destination: string;
  onCaseChange: (caseId: string | null) => void;
  onSessionPick: (
    sessionId: string | null,
    court?: string,
    date?: string
  ) => void;
  onDestinationChange: (v: string) => void;
}) {
  const { cases } = useCases();
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(!caseId);

  const selectedCase = caseId
    ? cases.find((c) => c.id === caseId) ?? null
    : null;
  const sessions = selectedCase?.sessions ?? [];
  const selectedSession =
    sessions.find((s) => s.id === sessionId) ?? null;

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? cases.slice(0, 8)
      : cases
          .filter(
            (c) =>
              c.code.toLowerCase().includes(q) ||
              (c.caseNumber ?? "").toLowerCase().includes(q) ||
              (c.requestTitle ?? "").toLowerCase().includes(q)
          )
          .slice(0, 8);
    return list;
  })();

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] text-amber-700 font-bold">
          اختر القضية لملء الوجهة تلقائياً (اختياري)
        </span>
        <h4 className="text-xs font-bold text-amber-900 inline-flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          ربط الانتداب بقضية
        </h4>
      </div>

      {selectedCase && !pickerOpen ? (
        <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 border border-emerald-200">
          <button
            type="button"
            onClick={() => {
              onCaseChange(null);
              onSessionPick(null);
              setPickerOpen(true);
            }}
            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
            title="إزالة الربط"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 min-w-0 text-right">
            <div className="text-xs font-bold text-emerald-800 truncate">
              {selectedCase.requestTitle || selectedCase.code}
            </div>
            <div
              className="text-[10px] text-emerald-700/80 font-mono"
              dir="ltr"
            >
              {selectedCase.caseNumber
                ? `${selectedCase.caseNumber} · ${selectedCase.code}`
                : selectedCase.code}
            </div>
          </div>
          <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Input
            placeholder="ابحث بكود/رقم/عنوان القضية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white">
            {filtered.length === 0 ? (
              <div className="text-center text-[10px] text-slate-400 py-4">
                لا توجد قضايا مطابقة
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    onCaseChange(c.id);
                    setPickerOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-right hover:bg-amber-50 border-b border-slate-100 last:border-b-0"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-xs font-bold text-slate-700 truncate">
                      {c.requestTitle || c.code}
                    </div>
                    <div
                      className="text-[10px] text-slate-500 font-mono"
                      dir="ltr"
                    >
                      {c.caseNumber
                        ? `${c.caseNumber} · ${c.code}`
                        : c.code}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedCase && sessions.length > 0 && (
        <Field label="ربط بجلسة محددة (اختياري)">
          <select
            value={sessionId ?? ""}
            onChange={(e) => {
              const sid = e.target.value || null;
              const s = sessions.find((x) => x.id === sid);
              onSessionPick(sid, s?.court, s?.date);
            }}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 text-right"
          >
            <option value="">— لا أربط بجلسة محددة —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date}
                {s.time ? ` · ${s.time}` : ""}
                {s.court ? ` · ${s.court}` : ""}
                {s.sessionNumber ? ` (#${s.sessionNumber})` : ""}
              </option>
            ))}
          </select>
        </Field>
      )}

      {selectedSession && (
        <div className="text-[10px] text-emerald-700 font-bold text-right">
          ✓ تم ملء الوجهة والتاريخ من بيانات الجلسة
        </div>
      )}

      <Field label="وجهة الانتداب *">
        <Input
          placeholder="مثال: محكمة الاستئناف بالرياض / مكتب الفرع / عميل..."
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
        />
      </Field>
    </div>
  );
}
