import { useEffect, useRef, useState } from "react";
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
  Upload,
  Download,
  X,
  FileText,
  Image as ImageIcon,
  FileType,
  Gavel,
  Video,
  MapPin,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import {
  getCase,
  deleteCase,
  updateCase,
  type CaseRecord,
  type CaseAttachment,
  type CaseSession,
} from "../../lib/caseStore";
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
import { initialCase } from "../../components/cases/caseFormTypes";

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

const fmtSize = (n: number) => {
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (files: FileList | null) => {
    if (!files || !caseData) return;
    setUploading(true);
    try {
      const accepted: CaseAttachment[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 10 * 1024 * 1024) {
          alert(`${f.name} — يتجاوز 10 ميجابايت`);
          continue;
        }
        const dataUrl = await readAsDataURL(f);
        accepted.push({ name: f.name, size: f.size, type: f.type, dataUrl });
      }
      if (accepted.length === 0) return;
      const next = [...(caseData.attachments ?? []), ...accepted];
      await updateCase(caseData.id, {
        ...initialCase,
        ...caseData,
        startDate: caseData.startDate ?? "",
        expectedEndDate: caseData.expectedEndDate ?? "",
        assignmentDate: caseData.assignmentDate ?? "",
        caseDate: caseData.caseDate ?? "",
        clientType: "individual",
        clientName: "",
        idType: "national",
        idNumber: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        clientRole: (caseData.clientRole as "plaintiff" | "defendant") || "plaintiff",
        opponentRole: (caseData.opponentRole as "plaintiff" | "defendant") || "defendant",
        fees: (caseData.fees as typeof initialCase.fees) ?? initialCase.fees,
        attachments: next,
        assignedLawyer: caseData.assignedLawyer ?? "",
        linkedContract: caseData.linkedContract ?? "",
      });
      await refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveAttachment = async (idx: number) => {
    if (!caseData) return;
    if (!confirm("هل تريد حذف هذا المرفق؟")) return;
    const next = caseData.attachments.filter((_, i) => i !== idx);
    await updateCase(caseData.id, {
      ...initialCase,
      ...caseData,
      startDate: caseData.startDate ?? "",
      expectedEndDate: caseData.expectedEndDate ?? "",
      assignmentDate: caseData.assignmentDate ?? "",
      caseDate: caseData.caseDate ?? "",
      clientType: "individual",
      clientName: "",
      idType: "national",
      idNumber: "",
      phone: "",
      email: "",
      city: "",
      address: "",
      clientRole: (caseData.clientRole as "plaintiff" | "defendant") || "plaintiff",
      opponentRole: (caseData.opponentRole as "plaintiff" | "defendant") || "defendant",
      fees: (caseData.fees as typeof initialCase.fees) ?? initialCase.fees,
      attachments: next,
      assignedLawyer: caseData.assignedLawyer ?? "",
      linkedContract: caseData.linkedContract ?? "",
    });
    await refresh();
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

  // Build maps of non-empty entries for compact rendering
  const clientEntries = client
    ? [
        ["الاسم", client.fullName, false],
        ["الكود", client.code, true],
        ["رقم الهوية", client.idNumber, true],
        ["رقم الجوال", client.phone, true],
        ["البريد", client.email, true],
      ].filter(([, v]) => v) as [string, string, boolean][]
    : [];

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
              تعديل
            </Link>
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة
            </Link>
          </div>
          <div className="text-right min-w-0 flex-1">
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

        {c.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-700 leading-7 text-right whitespace-pre-line">
              {c.description}
            </p>
          </div>
        )}
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section
          title="العميل"
          icon={UserIcon}
          badge={c.clientRole === "plaintiff" ? "مدّعي" : "مدّعى عليه"}
          badgeColor={c.clientRole === "plaintiff" ? "brand" : "rose"}
        >
          {client ? (
            <KV entries={clientEntries} />
          ) : (
            <Empty text="لا يوجد عميل مرتبط" />
          )}
        </Section>

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
                ].filter(([, v]) => v) as [string, string, boolean][];
                const roleLabel = p.role === "plaintiff" ? "مدّعي" : "مدّعى عليه";
                const roleClass =
                  p.role === "plaintiff"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-rose-100 text-rose-700";
                return (
                  <div
                    key={p.id || i}
                    className="rounded-lg border border-slate-200 bg-slate-50/40 p-3"
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${roleClass}`}
                      >
                        {roleLabel}
                      </span>
                      <div className="text-sm font-bold text-slate-700">
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
      </div>

      {/* Case details + admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="تفاصيل القضية" icon={Hash}>
          {caseEntries.length > 0 ? (
            <KV entries={caseEntries} />
          ) : (
            <Empty text="لا توجد تفاصيل" />
          )}
        </Section>

        <Section title="المدة والإدارة" icon={CalendarDays}>
          {adminEntries.length > 0 ? (
            <KV entries={adminEntries} />
          ) : (
            <Empty text="لا توجد بيانات إدارة" />
          )}
        </Section>
      </div>

      {/* Assignments */}
      <Section title={`الإسناد (${enrichedAssignments.length})`} icon={Scale}>
        {enrichedAssignments.length === 0 ? (
          <Empty text="لم يتم إسناد القضية لأحد" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {enrichedAssignments.map((a) => (
              <AssignmentChip key={a.userId} item={a} />
            ))}
          </div>
        )}
      </Section>

      {/* Sessions */}
      <Section title={`الجلسات (${c.sessions.length})`} icon={Gavel}>
        {c.sessions.length === 0 ? (
          <Empty text="لا توجد جلسات مسجّلة" />
        ) : (
          <ul className="space-y-2">
            {[...c.sessions]
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
          </ul>
        )}
      </Section>

      {/* Attachments */}
      <Section
        title={`المرفقات (${c.attachments.length})`}
        icon={Paperclip}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 mb-2 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mb-2" strokeWidth={1.4} />
            )}
            <span className="text-sm font-bold">
              {uploading ? "جارٍ الرفع..." : "اضغط لرفع مرفق جديد"}
            </span>
            <span className="text-xs mt-1">حتى 10 ميجابايت لكل ملف</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />

          {c.attachments.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {c.attachments.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(i)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md shrink-0"
                    title="حذف"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={a.dataUrl}
                    download={a.name}
                    className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md shrink-0"
                    title="تحميل"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-sm text-slate-700 truncate" title={a.name}>
                      {a.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {fmtSize(a.size)}
                    </div>
                  </div>
                  <FileBadge type={a.type} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* Financial */}
      <Section title="المالية" icon={Wallet}>
        {financialEntries.length > 0 ? (
          <KV entries={financialEntries} columns={2} />
        ) : (
          <Empty text="لا توجد بيانات مالية" />
        )}
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
  const wrapperCls = isOnline
    ? "border-violet-200 bg-violet-50/40"
    : "border-sky-200 bg-sky-50/40";
  const modeChipCls = isOnline
    ? "bg-violet-500 text-white"
    : "bg-sky-500 text-white";
  const ModeIcon = isOnline ? Video : MapPin;

  const dateLabel = s.date
    ? new Date(s.date).toLocaleDateString("ar-EG-u-nu-latn", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <li className={`rounded-xl border p-3 ${wrapperCls}`}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${modeChipCls}`}
        >
          <ModeIcon className="w-3 h-3" />
          {isOnline ? "أون لاين" : "حضوري"}
        </span>
        <div className="flex items-center justify-start gap-2 text-sm">
          {s.time && (
            <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <bdi dir="ltr">{s.time}</bdi>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
            <CalendarDays className="w-3.5 h-3.5" />
            <bdi dir="rtl">{dateLabel}</bdi>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {s.court && (
          <div className="flex items-start justify-end gap-1.5 text-slate-700">
            <span className="flex-1 text-right">{s.court}</span>
            <span className="text-xs text-slate-500 shrink-0">المحكمة:</span>
          </div>
        )}
        {isOnline && s.link ? (
          <div className="flex items-start justify-end gap-1.5 text-slate-700 min-w-0">
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-left truncate text-brand-600 hover:text-brand-700 underline inline-flex items-center gap-1 justify-end"
              dir="ltr"
            >
              <LinkIcon className="w-3 h-3 shrink-0" />
              {s.link}
            </a>
            <span className="text-xs text-slate-500 shrink-0">الرابط:</span>
          </div>
        ) : (
          !isOnline &&
          s.location && (
            <div className="flex items-start justify-end gap-1.5 text-slate-700">
              <span className="flex-1 text-right">{s.location}</span>
              <span className="text-xs text-slate-500 shrink-0">المكان:</span>
            </div>
          )
        )}
      </div>

      {s.details && (
        <div className="mt-2 pt-2 border-t border-white/50 text-xs text-slate-600 leading-6 text-right whitespace-pre-line">
          {s.details}
        </div>
      )}
    </li>
  );
}

function FileBadge({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-4 h-4 text-violet-600" />
      </div>
    );
  }
  if (type === "application/pdf") {
    return (
      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-4 h-4 text-brand-600" />
    </div>
  );
}
