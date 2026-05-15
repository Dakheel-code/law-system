import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Gavel,
  Calendar,
  Clock,
  MapPin,
  Video,
  Link as LinkIcon,
  Building2,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PauseCircle,
  Hash,
  ScrollText,
  ArrowRightCircle,
  Paperclip,
  Upload,
  ExternalLink,
} from "lucide-react";
import {
  useCases,
  removeSession,
  addAttachmentsToSession,
  removeAttachmentFromSession,
  type CaseRecord,
  type CaseAttachment,
} from "../lib/caseStore";
import type { CaseSession, SessionStatus } from "../components/cases/caseFormTypes";
import { toLocalISO } from "../lib/hijri";
import SessionFormModal from "../components/sessions/SessionFormModal";
import SessionReport from "../components/sessions/SessionReport";
import {
  uploadSessionFile,
  DriveNotConnectedError,
  DriveDisconnectedError,
} from "../lib/drive";
import { useClients } from "../lib/clientStore";
import { useUsers } from "../lib/userStore";

const statusMeta: Record<
  SessionStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  scheduled: {
    label: "مجدّولة",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200",
    icon: Calendar,
  },
  held: {
    label: "انعقدت",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  postponed: {
    label: "مؤجَّلة",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: PauseCircle,
  },
  cancelled: {
    label: "ملغاة",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    icon: XCircle,
  },
};

const fmtDateFull = (iso: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function SessionDetail() {
  const { caseId = "", sessionId = "" } = useParams();
  const navigate = useNavigate();
  const { cases, loading } = useCases();
  const { clients } = useClients();
  const { users } = useUsers();
  const [editing, setEditing] = useState(false);

  const { caseRec, session } = useMemo(() => {
    const c = cases.find((c) => c.id === caseId);
    const s = c?.sessions?.find((s) => s.id === sessionId) ?? null;
    return { caseRec: c ?? null, session: s };
  }, [cases, caseId, sessionId]);

  if (loading) {
    return (
      <div className="card p-16 text-center text-sm text-slate-400">
        جارٍ التحميل...
      </div>
    );
  }

  if (!caseRec || !session) {
    return (
      <div className="card p-16 flex flex-col items-center text-center">
        <AlertCircle className="w-14 h-14 text-rose-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">
          الجلسة غير موجودة
        </h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          ربما تم حذفها أو نُقلت إلى قضية أخرى
        </p>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الجلسات
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `هل تريد حذف جلسة "${session.sessionNumber || session.id}" من قضية «${caseRec.requestTitle || caseRec.code}»؟`
      )
    )
      return;
    const ok = await removeSession(caseRec.id, session.id);
    if (ok) navigate("/sessions");
  };

  const today = toLocalISO(new Date());
  const isPast = session.date < today;
  const isToday = session.date === today;
  const isOnline = session.mode === "online";
  const ModeIcon = isOnline ? Video : MapPin;

  const effectiveStatus: SessionStatus =
    session.status ?? (isPast ? "held" : "scheduled");
  const sm = statusMeta[effectiveStatus];
  const StatusIcon = sm.icon;

  return (
    <div className="space-y-5">
      {/* Breadcrumb / Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowRight className="w-4 h-4" />
          الجلسات
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Edit3 className="w-4 h-4" />
            تعديل الجلسة
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-white border-brand-200">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border ${sm.bg} ${sm.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {sm.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold ${
                  isOnline
                    ? "bg-violet-100 text-violet-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                <ModeIcon className="w-3 h-3" />
                {isOnline ? "أون لاين" : "حضوري"}
              </span>
              {isToday && (
                <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-brand-100 text-brand-700">
                  اليوم
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">
              جلسة قضية «{caseRec.requestTitle || caseRec.code}»
            </h1>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-3 flex-wrap font-mono" dir="ltr">
              {caseRec.caseNumber && <span>{caseRec.caseNumber}</span>}
              <span>·</span>
              <span>{caseRec.code}</span>
              {session.sessionNumber && (
                <>
                  <span>·</span>
                  <span>جلسة #{session.sessionNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <QuickStat
            icon={Calendar}
            label="التاريخ"
            value={fmtDateFull(session.date)}
            tone="text-sky-700"
            iconBg="bg-sky-100"
          />
          <QuickStat
            icon={Clock}
            label="الوقت"
            value={session.time || "—"}
            tone="text-violet-700"
            iconBg="bg-violet-100"
            ltr
          />
          <QuickStat
            icon={Building2}
            label="المحكمة"
            value={session.court || "—"}
            tone="text-amber-700"
            iconBg="bg-amber-100"
          />
          <QuickStat
            icon={Hash}
            label="الدائرة"
            value={session.circuit || "—"}
            tone="text-emerald-700"
            iconBg="bg-emerald-100"
          />
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {session.details && (
            <NarrativeBlock
              icon={FileText}
              title="تفاصيل الجلسة"
              text={session.details}
            />
          )}

          {session.decision && (
            <NarrativeBlock
              icon={Gavel}
              title="القرار الصادر"
              text={session.decision}
              tone="emerald"
            />
          )}

          {session.minutes && (
            <NarrativeBlock
              icon={ScrollText}
              title="محضر الجلسة"
              text={session.minutes}
            />
          )}

          {(session.nextDate || session.nextAction) && (
            <div className="card p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-3 inline-flex items-center gap-2">
                <ArrowRightCircle className="w-4 h-4 text-brand-500" />
                الإجراء القادم
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.nextDate && (
                  <InfoCell
                    label="موعد الجلسة القادمة"
                    value={fmtDateFull(session.nextDate)}
                  />
                )}
                {session.nextAction && (
                  <InfoCell
                    label="الإجراء المطلوب"
                    value={session.nextAction}
                  />
                )}
              </div>
            </div>
          )}

          {!session.details &&
            !session.decision &&
            !session.minutes &&
            !session.nextDate &&
            !session.nextAction && (
              <div className="card p-10 text-center text-sm text-slate-400">
                لا توجد تفاصيل إضافية لهذه الجلسة بعد. اضغط "تعديل الجلسة"
                لإضافة محضر أو قرار أو الإجراء القادم.
              </div>
            )}

          <SessionAttachments caseRec={caseRec} session={session} />

          {/* Session report — printable / PDF template */}
          <div className="card p-5">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 pb-3 border-b border-slate-100 inline-flex items-center gap-2 w-full">
              <FileText className="w-4 h-4 text-brand-500" />
              تقرير الجلسة
            </h3>
            <SessionReport
              caseRec={caseRec}
              session={session}
              client={
                caseRec.clientId
                  ? clients.find((c) => c.id === caseRec.clientId) ?? null
                  : null
              }
              users={users}
            />
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Location / link */}
          <div className="card p-5">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 inline-flex items-center gap-2">
              <ModeIcon className="w-4 h-4 text-brand-500" />
              {isOnline ? "بيانات الاتصال" : "موقع الجلسة"}
            </h3>
            {isOnline ? (
              session.link ? (
                <a
                  href={session.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100 break-all"
                  dir="ltr"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {session.link}
                </a>
              ) : (
                <p className="text-xs text-slate-400">لم يُحدَّد رابط الاتصال</p>
              )
            ) : session.location ? (
              <div className="text-sm text-slate-700 text-right">
                <div className="inline-flex items-center gap-1.5 text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  المكان
                </div>
                <div className="font-bold">{session.location}</div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">لم يُحدَّد المكان</p>
            )}
          </div>

          {/* Case link card */}
          <div className="card p-5">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 inline-flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              القضية المرتبطة
            </h3>
            <Link
              to={`/cases/${caseRec.id}`}
              className="block p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-lg transition text-right"
            >
              <div className="text-sm font-bold text-slate-800">
                {caseRec.requestTitle || caseRec.code}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono" dir="ltr">
                {caseRec.caseNumber
                  ? `${caseRec.caseNumber} · ${caseRec.code}`
                  : caseRec.code}
              </div>
              {caseRec.caseType && (
                <div className="text-[11px] text-slate-600 mt-2">
                  نوع القضية:{" "}
                  <span className="font-bold">{caseRec.caseType}</span>
                </div>
              )}
            </Link>
          </div>

          {/* All other sessions of this case */}
          {(caseRec.sessions?.length ?? 0) > 1 && (
            <div className="card p-5">
              <h3 className="text-sm font-extrabold text-slate-800 mb-3 inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                جلسات القضية الأخرى
              </h3>
              <ul className="space-y-2">
                {caseRec.sessions
                  .filter((s) => s.id !== session.id)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 8)
                  .map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/sessions/${caseRec.id}/${s.id}`}
                        className="block p-2 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-lg transition text-right"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                            {s.time}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {fmtDateFull(s.date)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <SessionFormModal
          initialCaseId={caseRec.id}
          initialSession={session as CaseSession}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// Components
// ============================================================

function QuickStat({
  icon: Icon,
  label,
  value,
  tone,
  iconBg,
  ltr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
  iconBg: string;
  ltr?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <div className="text-right min-w-0 flex-1">
        <div className="text-[10px] text-slate-500">{label}</div>
        <div
          className="text-sm font-bold text-slate-800 truncate"
          {...(ltr ? { dir: "ltr" } : {})}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function NarrativeBlock({
  icon: Icon,
  title,
  text,
  tone = "slate",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  tone?: "slate" | "emerald";
}) {
  const accent =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/40"
      : "border-slate-200";
  const iconColor = tone === "emerald" ? "text-emerald-600" : "text-brand-500";
  return (
    <div className={`card p-5 ${accent}`}>
      <h3 className="text-sm font-extrabold text-slate-800 mb-2 inline-flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {title}
      </h3>
      <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap text-right">
        {text}
      </p>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
      <div className="text-[10px] text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}

function isImageType(type: string, name: string): boolean {
  if (type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif|heic)$/i.test(name);
}

function isPdfType(type: string, name: string): boolean {
  return type === "application/pdf" || /\.pdf$/i.test(name);
}

function fileKind(a: CaseAttachment): {
  label: string;
  cls: string;
} {
  if (isImageType(a.type, a.name)) {
    return { label: "صورة", cls: "bg-violet-100 text-violet-700" };
  }
  if (isPdfType(a.type, a.name)) {
    return { label: "PDF", cls: "bg-rose-100 text-rose-700" };
  }
  if (/\.(docx?|odt|rtf)$/i.test(a.name)) {
    return { label: "وثيقة", cls: "bg-sky-100 text-sky-700" };
  }
  if (/\.(xlsx?|csv)$/i.test(a.name)) {
    return { label: "جدول", cls: "bg-emerald-100 text-emerald-700" };
  }
  if (/\.(pptx?|key)$/i.test(a.name)) {
    return { label: "عرض", cls: "bg-amber-100 text-amber-700" };
  }
  const ext = a.name.split(".").pop()?.toUpperCase() ?? "ملف";
  return { label: ext, cls: "bg-slate-100 text-slate-600" };
}

function AttachmentCard({
  attachment: a,
  onRemove,
}: {
  attachment: CaseAttachment;
  onRemove: () => void;
}) {
  const kind = fileKind(a);
  const isImage = isImageType(a.type, a.name);

  // Prefer thumbnailLink (Drive-rendered), then dataUrl (legacy base64 for old images),
  // then iconLink (small file-type icon).
  const previewSrc = a.thumbnailLink || (isImage ? a.dataUrl : undefined);

  const open = () => {
    if (a.webViewLink) window.open(a.webViewLink, "_blank", "noopener,noreferrer");
  };

  return (
    <li className="group relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-brand-300 transition overflow-hidden flex flex-col">
      {/* Preview area */}
      <button
        onClick={open}
        disabled={!a.webViewLink}
        className="relative w-full aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden cursor-pointer disabled:cursor-default flex items-center justify-center"
        title={a.webViewLink ? "فتح في Drive" : a.name}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={a.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition"
          />
        ) : a.iconLink ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <img src={a.iconLink} alt="" className="w-10 h-10" />
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kind.cls}`}>
              {kind.label}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
              <Paperclip className="w-6 h-6" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kind.cls}`}>
              {kind.label}
            </span>
          </div>
        )}

        {/* Kind badge on top of image previews */}
        {previewSrc && (
          <span
            className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold backdrop-blur-sm ${kind.cls}`}
          >
            {kind.label}
          </span>
        )}
      </button>

      {/* Meta + actions */}
      <div className="p-2.5 flex-1 flex flex-col gap-2">
        <div className="min-w-0 text-right">
          <div
            className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2"
            title={a.name}
          >
            {a.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{fmtBytes(a.size)}</div>
        </div>
        <div className="flex items-center justify-between gap-1 mt-auto">
          {a.webViewLink ? (
            <a
              href={a.webViewLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 rounded text-[10px] font-bold hover:bg-sky-100"
              title="فتح في Drive"
            >
              <ExternalLink className="w-3 h-3" />
              فتح
            </a>
          ) : (
            <span />
          )}
          <button
            onClick={onRemove}
            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
            title="إزالة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

function sessionDisplayName(s: CaseSession): string {
  const numPart = s.sessionNumber ? `جلسة ${s.sessionNumber}` : "جلسة";
  const datePart = s.date || s.id.slice(0, 6);
  return `${numPart} - ${datePart}`;
}

function caseDisplayName(c: CaseRecord): string {
  return `${c.requestTitle || c.code} (${c.code})`;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function SessionAttachments({
  caseRec,
  session,
}: {
  caseRec: CaseRecord;
  session: CaseSession;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const attachments = session.attachments ?? [];

  const handlePick = () => fileRef.current?.click();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: CaseAttachment[] = [];
      const sessName = sessionDisplayName(session);
      const caseName = caseDisplayName(caseRec);
      for (const f of files) {
        const df = await uploadSessionFile(
          caseRec.id,
          caseName,
          session.id,
          sessName,
          f,
          (l, t) => setProgress(t > 0 ? Math.round((l / t) * 100) : 0)
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
        await addAttachmentsToSession(caseRec.id, session.id, uploaded);
    } catch (err) {
      if (
        err instanceof DriveNotConnectedError ||
        err instanceof DriveDisconnectedError
      ) {
        setError("Drive غير متصل. اربطه من صفحة الإدارة.");
      } else {
        setError(err instanceof Error ? err.message : "فشل رفع الملف");
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = async (index: number, name: string) => {
    if (!confirm(`إزالة المرفق "${name}"؟`)) return;
    await removeAttachmentFromSession(caseRec.id, session.id, index);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <button
          onClick={handlePick}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? `جارٍ الرفع... ${progress}%` : "رفع ملف"}
        </button>
        <h3 className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-brand-500" />
          مرفقات الجلسة ({attachments.length})
        </h3>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {error && (
        <div className="p-2 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 text-right">
          {error}
        </div>
      )}
      {attachments.length === 0 ? (
        <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-lg">
          لا توجد مرفقات. ترفع الملفات في:{" "}
          <span className="font-mono text-slate-500">
            {caseDisplayName(caseRec)} / الجلسات / {sessionDisplayName(session)}
          </span>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {attachments.map((a, idx) => (
            <AttachmentCard
              key={`${a.name}-${idx}`}
              attachment={a}
              onRemove={() => handleRemove(idx, a.name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
