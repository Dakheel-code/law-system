// Leave approvals (manager only) — approve / reject pending requests + view history.

import { useMemo, useState } from "react";
import {
  CheckCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Calendar,
  Clock,
  X,
  Save,
  Settings,
  User as UserIcon,
  Briefcase,
  MapPin,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff, useUsers } from "../../lib/userStore";
import {
  useAllLeaveRequests,
  useHrSettings,
  approveLeaveRequest,
  rejectLeaveRequest,
  updateHrSettings,
  leaveTypeLabels,
  leaveStatusLabels,
  leaveStatusClasses,
  leaveCategoryLabels,
  leaveCategoryClasses,
  type LeaveRequest,
  type LeaveStatus,
} from "../../lib/leaveStore";
import InfoBanner from "../../components/ui/InfoBanner";
import { Field, Input, Textarea } from "../../components/ui/Field";

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

export default function LeaveApprovalsPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { requests } = useAllLeaveRequests();
  const { users } = useUsers();
  const { settings } = useHrSettings();
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null);
  const [scope, setScope] = useState<LeaveStatus | "all">("pending");
  const [showSettings, setShowSettings] = useState(false);

  const isManager = staff?.type === "manager";

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  const filtered = useMemo(() => {
    if (scope === "all") return requests;
    return requests.filter((r) => r.status === scope);
  }, [requests, scope]);

  const counts = useMemo(() => {
    const c: Record<LeaveStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    requests.forEach((r) => c[r.status]++);
    return c;
  }, [requests]);

  if (!isManager) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700">ليس لديك صلاحية</h2>
        <p className="text-sm text-slate-500 mt-1">
          الموافقة على الإجازات والاستئذانات متاحة للمستخدمين من نوع "مدير" فقط.
        </p>
      </div>
    );
  }

  const handleApprove = async (r: LeaveRequest) => {
    if (!staff?.id) return;
    if (!confirm(`الموافقة على طلب ${leaveTypeLabels[r.type]}؟`)) return;
    await approveLeaveRequest(r.id, staff.id);
  };

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={CheckCheck}
        title="موافقات الإجازات"
        description="راجع طلبات الإجازة والاستئذان المعلَّقة من الموظفين، ووافق عليها أو ارفضها مع توضيح السبب."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CounterCard
          label="معلَّقة"
          value={counts.pending}
          tone="amber"
          icon={Hourglass}
          active={scope === "pending"}
          onClick={() => setScope("pending")}
        />
        <CounterCard
          label="مقبولة"
          value={counts.approved}
          tone="emerald"
          icon={CheckCircle2}
          active={scope === "approved"}
          onClick={() => setScope("approved")}
        />
        <CounterCard
          label="مرفوضة"
          value={counts.rejected}
          tone="rose"
          icon={XCircle}
          active={scope === "rejected"}
          onClick={() => setScope("rejected")}
        />
        <CounterCard
          label="الكل"
          value={requests.length}
          tone="slate"
          icon={CheckCheck}
          active={scope === "all"}
          onClick={() => setScope("all")}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold"
          >
            <Settings className="w-3.5 h-3.5" />
            الرصيد السنوي ({settings.annualLeaveDays} يوم)
          </button>
          <h2 className="text-lg font-extrabold text-slate-800">
            الطلبات ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-300">
            <CheckCheck className="w-12 h-12 mb-3" strokeWidth={1.2} />
            <p className="text-sm font-bold text-slate-500">
              {scope === "pending"
                ? "لا توجد طلبات معلَّقة 🎉"
                : "لا توجد طلبات"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const requester = userById.get(r.userId);
              return (
                <li
                  key={r.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/60 flex-wrap"
                >
                  {/* Avatar */}
                  {requester?.avatarDataUrl ? (
                    <img
                      src={requester.avatarDataUrl}
                      alt={requester.fullName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {(
                        requester?.firstName?.[0] ||
                        requester?.fullName?.[0] ||
                        "؟"
                      ).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
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
                      <span className="text-sm font-extrabold text-slate-800">
                        {requester?.fullName || requester?.code || "—"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      {r.type === "permission" ? (
                        <span>
                          {fmtDate(r.startDate)} ·{" "}
                          <bdi dir="ltr">
                            {r.startTime} – {r.endTime}
                          </bdi>
                          {" · "}
                          <strong>{r.hours?.toFixed(1)} ساعة</strong>
                        </span>
                      ) : (
                        <span>
                          {fmtDate(r.startDate)}
                          {r.startDate !== r.endDate &&
                            ` → ${fmtDate(r.endDate)}`}
                          {" · "}
                          <strong>{r.days} يوم</strong>
                        </span>
                      )}
                    </div>
                    {r.type === "delegation" && r.destination && (
                      <div className="flex items-center justify-end gap-1 text-[11px] text-amber-700 font-bold mt-1.5">
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
                              {a.name.slice(0, 30)}
                              {a.name.length > 30 ? "..." : ""}
                            </a>
                          ) : (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              {a.name.slice(0, 30)}
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
                    {r.status === "approved" && r.approvedBy && (
                      <div className="text-[10px] text-emerald-600 mt-1.5 inline-flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        اعتمد بواسطة:{" "}
                        {userById.get(r.approvedBy)?.fullName ||
                          userById.get(r.approvedBy)?.code ||
                          "—"}
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject */}
                  {r.status === "pending" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApprove(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-bold shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        قبول
                      </button>
                      <button
                        onClick={() => setRejecting(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-xs font-bold shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        رفض
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rejecting && staff && (
        <RejectModal
          request={rejecting}
          approverId={staff.id}
          onClose={() => setRejecting(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          initialDays={settings.annualLeaveDays}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// Counter card
// ============================================================

const counterTones = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  rose: "bg-rose-50 border-rose-100 text-rose-700",
  slate: "bg-slate-50 border-slate-200 text-slate-700",
} as const;

function CounterCard({
  label,
  value,
  tone,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: keyof typeof counterTones;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 ${counterTones[tone]} p-4 flex items-center gap-3 hover:shadow-md transition text-right ${
        active ? "ring-2 ring-offset-2 ring-current/30" : "opacity-90"
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-[11px] font-bold opacity-90">{label}</div>
        <div className="text-2xl font-extrabold mt-0.5 leading-none">
          {value}
        </div>
      </div>
    </button>
  );
}

// ============================================================
// Reject modal — manager provides a reason
// ============================================================

function RejectModal({
  request,
  approverId,
  onClose,
}: {
  request: LeaveRequest;
  approverId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      alert("اكتب سبب الرفض");
      return;
    }
    setSaving(true);
    const ok = await rejectLeaveRequest(request.id, approverId, reason.trim());
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-800">رفض الطلب</h2>
        </div>

        <div className="p-5 space-y-4">
          <Field label="سبب الرفض *">
            <Textarea
              placeholder="وضِّح للموظف سبب الرفض..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </Field>
          <p className="text-[11px] text-slate-500 text-right">
            سيتم إعلام الموظف بالسبب في صفحة "طلباتي".
          </p>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-lg text-sm font-bold shadow hover:bg-rose-600 disabled:opacity-60"
          >
            <XCircle className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "تأكيد الرفض"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HR Settings modal — annual leave balance
// ============================================================

function SettingsModal({
  initialDays,
  onClose,
}: {
  initialDays: number;
  onClose: () => void;
}) {
  const [days, setDays] = useState(initialDays);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const ok = await updateHrSettings({
      annualLeaveDays: Math.max(0, Math.floor(days)),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-800">
            إعدادات الإجازات
          </h2>
        </div>

        <div className="p-5 space-y-4">
          <Field label="رصيد الإجازات السنوي (لكل المستخدمين)">
            <Input
              type="number"
              min={0}
              max={365}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 0)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <p className="text-[11px] text-slate-500 text-right leading-5">
            هذا الرصيد ينطبق على جميع المستخدمين. يُحسب المتبقي تلقائياً
            بطرح الإجازات المقبولة والمعلَّقة من الرصيد الإجمالي.
          </p>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
