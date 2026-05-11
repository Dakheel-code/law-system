import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  Edit3,
  Trash2,
  Briefcase,
  Building2,
  User as UserIcon,
  UserX,
  CalendarDays,
  AlertOctagon,
  Wallet,
  FileText,
  StickyNote,
  Hash,
  Gavel,
  Clock,
} from "lucide-react";
import { getCase, deleteCase, type CaseRecord } from "../../lib/caseStore";
import { getClient, type ClientRecord } from "../../lib/clientStore";
import { useUsers } from "../../lib/userStore";
import { useOffice } from "../../lib/officeStore";
import {
  claimTypes,
  paymentStatus,
  paymentMethods,
  priorities,
  urgencyLevels,
} from "../../config/caseConfig";

const labelFor = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label || v || "—";

const priorityChip: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};
const urgencyChip: Record<string, string> = {
  normal: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-700",
};
const statusChip: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  ended: "bg-slate-200 text-slate-700",
  deferred: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
};
const statusLabel: Record<string, string> = {
  active: "نشطة",
  ended: "منتهية",
  deferred: "مؤجلة",
  pending: "بانتظار الإجراء",
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const fmtMoney = (n: number) =>
  n > 0 ? n.toLocaleString("en-US") + " ر.س" : "—";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users } = useUsers();
  const { office } = useOffice();
  const caseTypes = office?.caseTypes ?? [];
  const courtTypes = office?.courtTypes ?? [];
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const c = await getCase(id);
      if (cancelled) return;
      if (!c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCaseData(c);
      if (c.clientId) {
        const cl = await getClient(c.clientId);
        if (!cancelled) setClient(cl);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!caseData) return;
    if (!confirm(`حذف القضية "${caseData.code}"؟`)) return;
    const ok = await deleteCase(caseData.id);
    if (ok) navigate("/cases");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">جارٍ تحميل تفاصيل القضية...</span>
      </div>
    );
  }

  if (notFound || !caseData) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-bold text-slate-700">القضية غير موجودة</h2>
        <button
          onClick={() => navigate("/cases")}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  const c = caseData;
  const lawyer = users.find((u) => u.id === c.assignedLawyer);

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
            <Link
              to={`/cases/${c.id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600"
            >
              <Edit3 className="w-3.5 h-3.5" />
              تعديل القضية
            </Link>
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة
            </Link>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-start gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                  statusChip[c.status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {statusLabel[c.status] ?? c.status}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                  priorityChip[c.priority] ?? priorityChip.medium
                }`}
              >
                {labelFor(priorities, c.priority)}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                  urgencyChip[c.urgency] ?? urgencyChip.normal
                }`}
              >
                {(c.urgency === "high" || c.urgency === "critical") && (
                  <AlertOctagon className="w-3 h-3" />
                )}
                {labelFor(urgencyLevels, c.urgency)}
              </span>
              <span className="text-xs font-mono text-slate-400" dir="ltr">
                {c.code}
              </span>
            </div>
            <h2 className="flex items-center justify-start gap-2 text-xl font-extrabold text-slate-800">
              {c.requestTitle || "—"}
              <Briefcase className="w-5 h-5 text-brand-500" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              تم الإنشاء في{" "}
              <bdi dir="ltr">
                {new Date(c.createdAt).toLocaleDateString("ar-EG-u-nu-latn", {
                  dateStyle: "medium",
                })}
              </bdi>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Client */}
        <Section title="العميل" icon={UserIcon}>
          {client ? (
            <>
              <Row label="الاسم" value={client.fullName} />
              <Row label="الكود" value={client.code} mono />
              <Row label="رقم الهوية" value={client.idNumber || "—"} mono />
              <Row label="رقم الجوال" value={client.phone || "—"} mono />
              <Row label="البريد" value={client.email || "—"} mono />
            </>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">
              لا يوجد عميل مرتبط بهذه القضية
            </div>
          )}
          <Row
            label="صفة العميل"
            value={c.clientRole === "plaintiff" ? "مدّعي" : "مدّعى عليه"}
            highlight={c.clientRole === "plaintiff" ? "brand" : "rose"}
          />
        </Section>

        {/* Opponent */}
        <Section title="الطرف الآخر" icon={UserX}>
          <Row label="الاسم" value={c.otherPartyName || "—"} />
          <Row label="رقم الهوية" value={c.otherPartyId || "—"} mono />
          <Row label="رقم الجوال" value={c.otherPartyPhone || "—"} mono />
          <Row label="العنوان" value={c.otherPartyAddress || "—"} />
          <Row
            label="صفة الخصم"
            value={c.opponentRole === "plaintiff" ? "مدّعي" : "مدّعى عليه"}
            highlight={c.opponentRole === "plaintiff" ? "brand" : "rose"}
          />
        </Section>

        {/* Case details */}
        <Section title="تفاصيل القضية" icon={Hash}>
          <Row label="رقم القضية" value={c.caseNumber || "—"} mono />
          <Row label="نوع القضية" value={labelFor(caseTypes, c.caseType)} />
          <Row label="نوع المحكمة" value={labelFor(courtTypes, c.courtType)} />
          <Row label="اسم الدائرة" value={c.circuitName || "—"} />
          <Row label="نوع المطالبة" value={c.claimSubject || "—"} />
          <Row label="تاريخ تكليف القضية" value={fmtDate(c.assignmentDate)} />
          <Row label="تاريخ القضية" value={fmtDate(c.caseDate)} />
          {c.description && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="text-xs text-slate-500 mb-1">الوصف:</div>
              <p className="text-sm text-slate-700 leading-7 text-right whitespace-pre-line">
                {c.description}
              </p>
            </div>
          )}
        </Section>

        {/* Court & Schedule */}
        <Section title="المدة والإدارة" icon={CalendarDays}>
          <Row label="المحامي المسند" value={lawyer?.fullName || "—"} />
          <Row label="تاريخ البدء" value={fmtDate(c.startDate)} />
          <Row label="التاريخ المتوقع للانتهاء" value={fmtDate(c.expectedEndDate)} />
          <Row label="العقد المرتبط" value={c.linkedContract || "—"} />
        </Section>

        {/* Financial */}
        <Section title="المالية" icon={Wallet}>
          <Row
            label="نوع المطالبة"
            value={labelFor(claimTypes, c.claimType)}
          />
          <Row label="التكلفة المقدرة للأتعاب" value={fmtMoney(c.estimatedFees)} />
          <Row label="رسوم الاستشارة" value={fmtMoney(c.consultationFees)} />
          <Row label="الرسوم القضائية المتوقعة" value={fmtMoney(c.expectedCourtFees)} />
          <Row
            label="حالة الدفع"
            value={labelFor(paymentStatus, c.paymentStatus)}
          />
          <Row
            label="طريقة الدفع"
            value={c.paymentMethod ? labelFor(paymentMethods, c.paymentMethod) : "—"}
          />
        </Section>

        {/* Notes */}
        <Section title="الملاحظات النهائية" icon={StickyNote}>
          {c.finalNotes ? (
            <p className="text-sm text-slate-700 leading-7 text-right whitespace-pre-line">
              {c.finalNotes}
            </p>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">
              لا توجد ملاحظات
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
        {title}
        <Icon className="w-4 h-4 text-brand-500" />
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "brand" | "rose";
}) {
  const valClass =
    highlight === "brand"
      ? "text-brand-700 font-bold"
      : highlight === "rose"
      ? "text-rose-700 font-bold"
      : "text-slate-700";
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <div
        className={`${valClass} text-left ${mono ? "font-mono text-xs" : ""} flex-1 min-w-0`}
        dir={mono ? "ltr" : undefined}
      >
        {value}
      </div>
      <div className="text-slate-500 text-xs shrink-0">{label}</div>
    </div>
  );
}

// Re-exported icons not currently used inline but referenced in headers above
export { Building2, FileText, Clock, Gavel };
