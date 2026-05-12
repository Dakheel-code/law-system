import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  Edit3,
  Trash2,
  Briefcase,
  User as UserIcon,
  UserX,
  CalendarDays,
  AlertOctagon,
  Wallet,
  StickyNote,
  Hash,
  Scale,
  Paperclip,
  Gavel,
  Video,
  MapPin,
  Clock,
  Link as LinkIcon,
  Phone,
  Mail,
  TrendingUp,
} from "lucide-react";
import {
  getCase,
  deleteCase,
  type CaseRecord,
  type CaseSession,
} from "../../lib/caseStore";
import { ensureEntityFolder } from "../../lib/drive";
import DriveBrowser from "../../components/drive/DriveBrowser";
import { getClient, type ClientRecord } from "../../lib/clientStore";
import { useUsers, type UserRecord } from "../../lib/userStore";
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
    : "";

const fmtMoney = (n: number) => (n > 0 ? n.toLocaleString("en-US") + " ر.س" : "");

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

  const refresh = async () => {
    if (!id) return;
    const c = await getCase(id);
    if (!c) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setCaseData(c);
    if (c.clientId) {
      const cl = await getClient(c.clientId);
      setClient(cl);
    } else {
      setClient(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // Build a list of { user, role, customTitle } — prefer new `assignments`,
  // fall back to legacy `assignedLawyers`.
  const assignmentsList =
    c.assignments && c.assignments.length > 0
      ? c.assignments
      : (c.assignedLawyers ?? []).map((uid, i) => ({
          userId: uid,
          role: (i === 0 ? "primary" : "assistant") as
            | "primary"
            | "assistant",
          customTitle: undefined as string | undefined,
        }));
  const enrichedAssignments = assignmentsList
    .map((a) => {
      const user = users.find((u) => u.id === a.userId);
      return user ? { ...a, user } : null;
    })
    .filter(Boolean) as Array<{
    userId: string;
    role: "primary" | "assistant" | "supervisor" | "custom";
    customTitle?: string;
    user: UserRecord;
  }>;

  // Build parties list — prefer new `parties` array; fall back to legacy
  // `other_party_*` fields if it's empty.
  const parties =
    c.parties && c.parties.length > 0
      ? c.parties
      : c.otherPartyName
      ? [
          {
            id: "legacy-1",
            name: c.otherPartyName,
            role: (c.opponentRole as "plaintiff" | "defendant") || "defendant",
            idNumber: c.otherPartyId,
            phone: c.otherPartyPhone,
            address: c.otherPartyAddress,
          },
        ]
      : [];

  const caseEntries = [
    ["رقم القضية", c.caseNumber, true],
    ["نوع القضية", labelFor(caseTypes, c.caseType), false],
    ["نوع المحكمة", labelFor(courtTypes, c.courtType), false],
    ["اسم الدائرة", c.circuitName, false],
    ["نوع المطالبة", c.claimSubject, false],
    ["تاريخ تكليف القضية", fmtDate(c.assignmentDate), false],
    ["تاريخ القضية", fmtDate(c.caseDate), false],
  ].filter(([, v]) => v) as [string, string, boolean][];

  const adminEntries = [
    ["تاريخ البدء", fmtDate(c.startDate), false],
    ["التاريخ المتوقع للانتهاء", fmtDate(c.expectedEndDate), false],
    ["العقد المرتبط", c.linkedContract, false],
  ].filter(([, v]) => v) as [string, string, boolean][];

  const financialEntries = [
    ["نوع المطالبة", c.claimType ? labelFor(claimTypes, c.claimType) : "", false],
    ["التكلفة المقدرة للأتعاب", fmtMoney(c.estimatedFees), false],
    ["رسوم الاستشارة", fmtMoney(c.consultationFees), false],
    ["الرسوم القضائية المتوقعة", fmtMoney(c.expectedCourtFees), false],
    ["حالة الدفع", c.paymentStatus ? labelFor(paymentStatus, c.paymentStatus) : "", false],
    ["طريقة الدفع", c.paymentMethod ? labelFor(paymentMethods, c.paymentMethod) : "", false],
  ].filter(([, v]) => v) as [string, string, boolean][];

  // ---- Derived stats for the hero strip
  const daysSinceCreated = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const upcomingSessions = c.sessions.filter(
    (s) => s.date && s.date >= new Date().toISOString().slice(0, 10)
  ).length;
  const totalFees =
    (c.estimatedFees || 0) +
    (c.consultationFees || 0) +
    (c.expectedCourtFees || 0);

  const initials = client?.fullName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");

  return (
    <div className="space-y-5">
      {/* ============= Hero Header ============= */}
      <div className="card overflow-hidden">
        {/* Top action bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
            <Link
              to={`/cases/${c.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600"
            >
              <Edit3 className="w-3.5 h-3.5" />
              تعديل
            </Link>
          </div>
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            العودة للقائمة
          </Link>
        </div>

        {/* Title block — fully right-aligned, icon sits inline next to the title */}
        <div className="p-5 md:p-6 text-right">
          {/* Badges row */}
          <div className="flex items-center justify-start gap-2 flex-wrap mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                statusChip[c.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabel[c.status] ?? c.status}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                priorityChip[c.priority] ?? priorityChip.medium
              }`}
            >
              {labelFor(priorities, c.priority)}
            </span>
            {(c.urgency === "high" || c.urgency === "critical") && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  urgencyChip[c.urgency] ?? urgencyChip.normal
                }`}
              >
                <AlertOctagon className="w-3 h-3" />
                {labelFor(urgencyLevels, c.urgency)}
              </span>
            )}
            <span
              className="inline-flex items-center text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md"
              dir="ltr"
            >
              {c.code}
            </span>
          </div>

          {/* Title with inline icon on the right */}
          <div className="flex items-center justify-start gap-3 mb-3">
            <h1 className="text-2xl font-extrabold text-slate-800 leading-snug">
              {c.requestTitle || "—"}
            </h1>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 border border-brand-200">
              <Briefcase className="w-6 h-6 text-brand-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* Meta row — case number, creation date */}
          <div className="flex items-center justify-start gap-3 text-xs text-slate-500 flex-wrap">
            {c.caseNumber && (
              <span className="inline-flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                <bdi dir="ltr" className="font-mono font-bold text-slate-700">
                  {c.caseNumber}
                </bdi>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              أُنشئت{" "}
              <bdi dir="ltr">
                {new Date(c.createdAt).toLocaleDateString(
                  "ar-EG-u-nu-latn",
                  { dateStyle: "medium" }
                )}
              </bdi>
            </span>
          </div>

          {c.description && (
            <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700 leading-7 whitespace-pre-line">
              {c.description}
            </p>
          )}
        </div>
      </div>

      {/* ============= Quick Stats Strip ============= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={Gavel}
          label="الجلسات"
          value={String(c.sessions.length)}
          sub={upcomingSessions > 0 ? `${upcomingSessions} قادمة` : "—"}
          tint="sky"
        />
        <Stat
          icon={Scale}
          label="المحامون المسندون"
          value={String(enrichedAssignments.length)}
          sub={enrichedAssignments.length > 0 ? "نشط" : "غير مُسند"}
          tint="violet"
        />
        <Stat
          icon={Clock}
          label="مدة القضية"
          value={String(daysSinceCreated)}
          sub="يوم منذ الإنشاء"
          tint="amber"
        />
        <Stat
          icon={TrendingUp}
          label="إجمالي الأتعاب"
          value={totalFees > 0 ? totalFees.toLocaleString("en-US") : "—"}
          sub={totalFees > 0 ? "ر.س" : "لم تُحدّد"}
          tint="emerald"
        />
      </div>

      {/* ============= 2-column main layout ============= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ===== Main column (2/3) ===== */}
        <div className="lg:col-span-2 space-y-5">
          {/* Parties */}
          <Section
            title={`أطراف القضية (${parties.length})`}
            icon={UserX}
          >
            {parties.length === 0 ? (
              <Empty text="لم يتم إضافة أي طرف" />
            ) : (
              <div className="space-y-3">
                {parties.map((p, i) => {
                  const entries = [
                    ["رقم الهوية", p.idNumber, true],
                    ["رقم الجوال", p.phone, true],
                    ["العنوان", p.address, false],
                    ["محامي الخصم", p.lawyer ?? "", false],
                    ["اسم الشركة / الجهة", p.companyName ?? "", false],
                    ["السجل التجاري", p.commercialRegistry ?? "", true],
                    ["الرقم الضريبي", p.taxNumber ?? "", true],
                  ].filter(([, v]) => v) as [string, string, boolean][];
                  const roleLabel =
                    p.role === "plaintiff" ? "مدّعي" : "مدّعى عليه";
                  const roleClass =
                    p.role === "plaintiff"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700";
                  return (
                    <div
                      key={p.id || i}
                      className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${roleClass}`}
                        >
                          {roleLabel}
                        </span>
                        <div className="text-sm font-bold text-slate-800">
                          {p.name || `الطرف ${i + 1}`}
                        </div>
                      </div>
                      {entries.length > 0 && <KV entries={entries} />}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Case details — only shown if there are entries */}
          {caseEntries.length > 0 && (
            <Section title="تفاصيل القضية" icon={Hash}>
              <KV entries={caseEntries} columns={2} />
            </Section>
          )}

          {/* Sessions */}
          <Section
            title={`الجلسات (${c.sessions.length})`}
            icon={Gavel}
          >
            {c.sessions.length === 0 ? (
              <Empty text="لا توجد جلسات مسجّلة" />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {[...c.sessions]
                  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                  .map((s) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
              </ul>
            )}
          </Section>

          {/* Attachments */}
          <Section title="المرفقات" icon={Paperclip}>
            <CaseAttachmentsBrowser caseData={c} />
          </Section>

          {/* Notes */}
          {c.finalNotes && (
            <Section title="الملاحظات النهائية" icon={StickyNote}>
              <p className="text-sm text-slate-700 leading-7 text-right whitespace-pre-line">
                {c.finalNotes}
              </p>
            </Section>
          )}
        </div>

        {/* ===== Sidebar (1/3) — sticky on desktop ===== */}
        <div className="space-y-5 lg:sticky lg:top-24 self-start">
          {/* Client card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  c.clientRole === "plaintiff"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {c.clientRole === "plaintiff" ? "مدّعي" : "مدّعى عليه"}
              </span>
              <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
                العميل
                <UserIcon className="w-4 h-4 text-brand-500" />
              </h3>
            </div>
            {client ? (
              <Link
                to={`/clients/${client.id}`}
                className="block group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-right flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-700">
                      {client.fullName}
                    </div>
                    <div
                      className="text-[11px] text-slate-500 font-mono mt-0.5"
                      dir="ltr"
                    >
                      {client.code}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-extrabold shrink-0 border border-brand-200">
                    {initials || <UserIcon className="w-5 h-5" />}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {client.idNumber && (
                    <InfoRow
                      icon={Hash}
                      label="رقم الهوية"
                      value={client.idNumber}
                      mono
                    />
                  )}
                  {client.phone && (
                    <InfoRow
                      icon={Phone}
                      label="الجوال"
                      value={client.phone}
                      mono
                    />
                  )}
                  {client.email && (
                    <InfoRow
                      icon={Mail}
                      label="البريد"
                      value={client.email}
                      ltr
                    />
                  )}
                </div>
              </Link>
            ) : (
              <Empty text="لا يوجد عميل مرتبط" />
            )}
          </div>

          {/* Assignments */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-normal">
                ({enrichedAssignments.length})
              </span>
              <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
                الإسناد
                <Scale className="w-4 h-4 text-brand-500" />
              </h3>
            </div>
            {enrichedAssignments.length === 0 ? (
              <Empty text="لم يتم إسناد القضية لأحد" />
            ) : (
              <div className="space-y-2">
                {enrichedAssignments.map((a) => (
                  <AssignmentChip key={a.userId} item={a} />
                ))}
              </div>
            )}
          </div>

          {/* Schedule & Admin */}
          {adminEntries.length > 0 && (
            <div className="card p-5">
              <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                المدة والإدارة
                <CalendarDays className="w-4 h-4 text-brand-500" />
              </h3>
              <KV entries={adminEntries} />
            </div>
          )}

          {/* Financial */}
          {financialEntries.length > 0 && (
            <div className="card p-5">
              <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                المالية
                <Wallet className="w-4 h-4 text-brand-500" />
              </h3>
              <KV entries={financialEntries} />
            </div>
          )}
        </div>
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
  badge,
  badgeColor,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: "brand" | "rose";
}) {
  const badgeClass =
    badgeColor === "brand"
      ? "bg-brand-100 text-brand-700"
      : "bg-rose-100 text-rose-700";
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${badgeClass}`}
          >
            {badge}
          </span>
        )}
        <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800">
          {title}
          <Icon className="w-4 h-4 text-brand-500" />
        </h3>
      </div>
      {children}
    </div>
  );
}

function KV({
  entries,
  columns = 1,
}: {
  entries: [string, string, boolean][];
  columns?: 1 | 2;
}) {
  return (
    <dl
      className={`grid ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      } gap-x-6 gap-y-2`}
    >
      {entries.map(([label, value, mono]) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-3 py-1 text-sm border-b border-slate-50 last:border-b-0"
        >
          <div
            className={`flex-1 min-w-0 text-left text-slate-700 truncate ${
              mono ? "font-mono text-xs" : ""
            }`}
            dir={mono ? "ltr" : undefined}
            title={value}
          >
            {value}
          </div>
          <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center py-6 text-xs text-slate-400">{text}</div>
  );
}

const statTints = {
  sky: "from-sky-50 to-sky-100 text-sky-700 ring-sky-200",
  violet: "from-violet-50 to-violet-100 text-violet-700 ring-violet-200",
  amber: "from-amber-50 to-amber-100 text-amber-700 ring-amber-200",
  emerald: "from-emerald-50 to-emerald-100 text-emerald-700 ring-emerald-200",
} as const;

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tint: keyof typeof statTints;
}) {
  return (
    <div className="card p-4 flex items-center gap-3 hover:shadow-md transition">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${statTints[tint]} flex items-center justify-center shrink-0 ring-1`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-[11px] text-slate-500 truncate">{label}</div>
        <div className="text-xl font-extrabold text-slate-800 mt-0.5 leading-none">
          <bdi dir="ltr">{value}</bdi>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  ltr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md group-hover:bg-brand-50/40 transition">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-[10px] text-slate-400 shrink-0">{label}</span>
      <span
        className={`text-xs text-slate-700 truncate text-left flex-1 ${
          mono || ltr ? "font-mono" : ""
        }`}
        dir={ltr ? "ltr" : undefined}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function CaseAttachmentsBrowser({ caseData }: { caseData: CaseRecord }) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const folderName = caseData.caseNumber || caseData.code || caseData.id;

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setFolderId(null);
    ensureEntityFolder("case", caseData.id, folderName)
      .then((id) => {
        if (!cancelled) setFolderId(id);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [caseData.id, folderName]);

  if (error) {
    return (
      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 text-right" dir="ltr">
        {error}
      </div>
    );
  }
  if (!folderId) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        جاري تجهيز مجلد القضية...
      </div>
    );
  }
  return (
    <DriveBrowser
      rootFolder={{ id: folderId, name: folderName }}
      showHeader={false}
    />
  );
}

const assignmentRoleStyles: Record<
  "primary" | "assistant" | "supervisor" | "custom",
  { bg: string; chip: string; iconColor: string; label: string }
> = {
  primary: {
    bg: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-600",
    label: "المحامي الأساسي",
  },
  assistant: {
    bg: "border-sky-200 bg-sky-50/60",
    chip: "bg-sky-100 text-sky-700",
    iconColor: "text-sky-600",
    label: "المحامي المساعد",
  },
  supervisor: {
    bg: "border-violet-200 bg-violet-50/60",
    chip: "bg-violet-100 text-violet-700",
    iconColor: "text-violet-600",
    label: "المشرف القانوني",
  },
  custom: {
    bg: "border-slate-200 bg-slate-50/60",
    chip: "bg-slate-200 text-slate-700",
    iconColor: "text-slate-600",
    label: "مخصص",
  },
};

function AssignmentChip({
  item,
}: {
  item: {
    role: "primary" | "assistant" | "supervisor" | "custom";
    customTitle?: string;
    user: UserRecord;
  };
}) {
  const styles = assignmentRoleStyles[item.role];
  const roleLabel =
    item.role === "custom"
      ? item.customTitle?.trim() || "مخصص"
      : styles.label;
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${styles.bg}`}>
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${styles.chip}`}
      >
        {roleLabel}
      </span>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-sm font-bold text-slate-800 truncate">
          {item.user.fullName || item.user.code}
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          {item.user.email || item.user.code}
        </div>
      </div>
      {item.user.avatarDataUrl ? (
        <img
          src={item.user.avatarDataUrl}
          alt={item.user.fullName}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shrink-0">
          {(item.user.firstName?.[0] || item.user.fullName?.[0] || "؟").toUpperCase()}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session: s }: { session: CaseSession }) {
  const isOnline = s.mode === "online";
  const today = new Date().toISOString().slice(0, 10);
  const isPast = s.date && s.date < today;
  const isToday = s.date === today;
  const ModeIcon = isOnline ? Video : MapPin;

  // Date pill tone
  const dateTone = isToday
    ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md"
    : isPast
    ? "bg-slate-100 text-slate-500 border border-slate-200"
    : "bg-white text-slate-700 border border-slate-200";

  // Card accent
  const cardCls = isToday
    ? "border-brand-300 ring-1 ring-brand-200"
    : isPast
    ? "border-slate-200 opacity-90"
    : "border-slate-200 hover:border-brand-300";

  const d = s.date ? new Date(s.date) : null;
  const weekday = d
    ? d.toLocaleDateString("ar-EG-u-nu-latn", { weekday: "short" })
    : "—";
  const dayNum = d
    ? d.toLocaleDateString("ar-EG-u-nu-latn", { day: "2-digit" })
    : "—";
  const monthName = d
    ? d.toLocaleDateString("ar-EG-u-nu-latn", { month: "short" })
    : "";
  const yearShort = d
    ? d.toLocaleDateString("ar-EG-u-nu-latn", { year: "numeric" })
    : "";

  return (
    <li className={`card p-3 transition ${cardCls}`}>
      {/* Top row: date pill + badges */}
      <div className="flex items-start gap-2 mb-2.5">
        <div
          className={`shrink-0 w-12 rounded-lg flex flex-col items-center py-1.5 ${dateTone}`}
        >
          <div className="text-[9px] font-bold opacity-90">
            {isToday ? "اليوم" : weekday}
          </div>
          <div className="text-lg font-extrabold leading-none my-0.5">
            <bdi dir="ltr">{dayNum}</bdi>
          </div>
          <div className="text-[9px] opacity-90">{monthName}</div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-end gap-1">
          <div className="flex items-center justify-start gap-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isOnline
                  ? "bg-violet-100 text-violet-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              <ModeIcon className="w-2.5 h-2.5" />
              {isOnline ? "أون لاين" : "حضوري"}
            </span>
            {isToday && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-100 text-brand-700">
                اليوم
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600">
                منتهية
              </span>
            )}
          </div>
          {s.time && (
            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <Clock className="w-2.5 h-2.5" />
              <bdi dir="ltr">{s.time}</bdi>
            </div>
          )}
        </div>
      </div>

      {/* Full date for context */}
      {d && (
        <div className="text-[10px] text-slate-500 mb-2 text-right" dir="rtl">
          {weekday}، {dayNum} {monthName} {yearShort}
        </div>
      )}

      {/* Info rows */}
      <div className="space-y-1 pt-2 border-t border-slate-100">
        {s.court && (
          <SessionInfoLine icon={Briefcase} label="المحكمة" value={s.court} />
        )}
        {!isOnline && s.location && (
          <SessionInfoLine icon={MapPin} label="المكان" value={s.location} />
        )}
        {isOnline && s.link && (
          <SessionInfoLine
            icon={LinkIcon}
            label="الرابط"
            value={s.link}
            href={s.link}
          />
        )}
        {!s.court && !s.location && !s.link && (
          <div className="text-[10px] text-slate-400 text-right">
            لا توجد تفاصيل
          </div>
        )}
      </div>

      {s.details && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-right">
          <p
            className="text-[11px] text-slate-600 leading-5 line-clamp-2 whitespace-pre-line"
            title={s.details}
          >
            {s.details}
          </p>
        </div>
      )}
    </li>
  );
}

function SessionInfoLine({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-start gap-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-500 shrink-0">{label}:</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand-600 hover:text-brand-700 underline truncate text-left"
          dir="ltr"
          title={value}
        >
          {value}
        </a>
      ) : (
        <span
          className="font-bold text-slate-700 truncate"
          title={value}
        >
          {value}
        </span>
      )}
    </div>
  );
}

