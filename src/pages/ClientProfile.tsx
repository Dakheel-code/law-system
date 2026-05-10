import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  User as UserIcon,
  Mail,
  Phone,
  Hash,
  Globe,
  Briefcase,
  FileText,
  Edit3,
  Trash2,
  Download,
  Eye,
  FileType,
  Calendar,
  StickyNote,
  Plus,
  Folder,
  CalendarClock,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useClients, deleteClient, type ClientRecord } from "../lib/clientStore";
import { nationalities } from "../config/nationalities";
import AttachmentPreview from "../components/ui/AttachmentPreview";

const clientTypeLabels: Record<string, string> = {
  individual: "فرد",
  private: "قطاع خاص",
  institution: "مؤسسة",
  government: "جهة حكومية",
  "semi-government": "شبه حكومية",
};

const contractTypeLabels: Record<string, string> = {
  default: "افتراضي",
  single: "أحادي",
  annual: "سنوي",
};

const formatDate = (iso: string) => {
  // Force Latin numerals via unicode locale extension
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const clients = useClients();
  const navigate = useNavigate();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const client = useMemo(
    () => clients.find((c) => c.id === id),
    [clients, id]
  );

  if (!client) {
    return (
      <div className="card p-12 text-center">
        <UserIcon className="w-14 h-14 mx-auto text-slate-300 mb-3" strokeWidth={1.2} />
        <h2 className="text-lg font-bold text-slate-700">العميل غير موجود</h2>
        <p className="text-sm text-slate-500 mt-1">
          ربما تم حذفه أو الرابط غير صحيح.
        </p>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للعملاء
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`حذف العميل "${client.fullName}"؟`)) {
      deleteClient(client.id);
      navigate("/clients", { replace: true });
    }
  };

  const nationalityLabel =
    nationalities.find((n) => n.value === client.nationality)?.label ??
    client.nationality ??
    "—";

  const initials = client.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");

  return (
    <div className="space-y-5">
      {/* Top toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
          <Link
            to={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
          >
            <Edit3 className="w-4 h-4" />
            تعديل
          </Link>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للقائمة
        </Link>
      </div>

      {/* Header — clean, no banner */}
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Right side: avatar + identity */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-20 h-20 rounded-2xl shadow-sm bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 border border-brand-200">
              <span className="text-2xl font-extrabold text-brand-700">
                {initials || <UserIcon className="w-9 h-9" />}
              </span>
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-end">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    client.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {client.status === "active" ? "نشط" : "معطّل"}
                </span>
                <span
                  className="inline-flex items-center text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md"
                  dir="ltr"
                >
                  {client.id}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 truncate">
                {client.fullName}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                مسجّل منذ {formatDate(client.createdAt)}
              </p>
            </div>
          </div>

          {/* Left side: type / contract badges */}
          <div className="flex flex-col items-stretch gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold whitespace-nowrap">
              <Tag className="w-3 h-3" />
              {clientTypeLabels[client.clientType] ?? client.clientType}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold whitespace-nowrap">
              <FileText className="w-3 h-3" />
              {contractTypeLabels[client.contractType] ?? client.contractType}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Briefcase} label="القضايا" value="0" tint="sky" />
        <Stat icon={FileText} label="الطلبات" value="0" tint="violet" />
        <Stat icon={CalendarClock} label="الجلسات" value="0" tint="emerald" />
        <Stat
          icon={Folder}
          label="المرفقات"
          value={String(client.attachments.length)}
          tint="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personal info */}
        <div className="lg:col-span-2 space-y-5">
          <Section title="المعلومات الشخصية" icon={UserIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InfoItem icon={Hash} label="رقم الهوية" value={client.idNumber} mono />
              <InfoItem icon={Globe} label="الجنسية" value={nationalityLabel} />
              <InfoItem icon={Phone} label="رقم الهاتف" value={client.phone} mono />
              <InfoItem icon={Mail} label="البريد الإلكتروني" value={client.email} ltr />
              <InfoItem
                icon={Tag}
                label="نوع العميل"
                value={clientTypeLabels[client.clientType] ?? client.clientType}
              />
              <InfoItem
                icon={Calendar}
                label="تاريخ التسجيل"
                value={formatDate(client.createdAt)}
              />
            </div>
          </Section>

          {/* Linked cases */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <Link
                to={`/cases/new?clientId=${client.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                ربط قضية
              </Link>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                القضايا المرتبطة
                <span className="text-xs text-slate-400 font-normal">(0)</span>
                <Briefcase className="w-4 h-4 text-brand-500" />
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <Briefcase className="w-8 h-8" strokeWidth={1.2} />
              </div>
              <p className="text-sm text-slate-600 font-medium">لا توجد قضايا مرتبطة بهذا العميل</p>
              <p className="text-xs text-slate-400 mt-1">يمكنك إنشاء قضية جديدة وربطها بالعميل</p>
              <Link
                to={`/cases/new?clientId=${client.id}`}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
              >
                <Plus className="w-4 h-4" />
                إنشاء قضية جديدة
              </Link>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <Section title="ملاحظات" icon={StickyNote}>
              <p className="text-sm text-slate-600 leading-7 text-right whitespace-pre-wrap">
                {client.notes}
              </p>
            </Section>
          )}
        </div>

        {/* Attachments sidebar */}
        <div>
          <div className="card p-5 lg:sticky lg:top-24">
            <h2 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              المرفقات
              <span className="text-xs text-slate-400 font-normal">
                ({client.attachments.length})
              </span>
              <FileText className="w-4 h-4 text-brand-500" />
            </h2>

            {client.attachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                <FileText className="w-10 h-10 mb-2" strokeWidth={1.2} />
                <p className="text-xs text-slate-500">لا توجد مرفقات</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {client.attachments.map((f, i) => (
                  <AttachmentRow
                    key={i}
                    file={f}
                    onPreview={() => setPreviewIndex(i)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {previewIndex !== null && (
        <AttachmentPreview
          attachments={client.attachments}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onChangeIndex={setPreviewIndex}
        />
      )}
    </div>
  );
}

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
      <h2 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">
        {title}
        <Icon className="w-4 h-4 text-brand-500" />
      </h2>
      {children}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: "sky" | "violet" | "emerald" | "amber";
}) {
  const styles: Record<string, string> = {
    sky: "from-sky-50 to-sky-100 text-sky-600",
    violet: "from-violet-50 to-violet-100 text-violet-600",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-600",
    amber: "from-amber-50 to-amber-100 text-amber-600",
  };
  return (
    <div className="card p-4 flex items-center justify-between">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles[tint]} flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

/**
 * InfoItem — label and value both right-aligned (RTL).
 * For LTR content (email), use `ltr` to wrap the value in dir="ltr"
 * (preserves correct character order) but the BLOCK stays right-aligned.
 * For numbers/IDs, use `mono` for monospace display.
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  ltr,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ltr?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-brand-600" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div
          className={`text-sm font-bold text-slate-800 mt-1 truncate ${
            mono ? "font-mono" : ""
          }`}
          title={value}
        >
          {value ? (
            ltr ? (
              <bdi dir="ltr">{value}</bdi>
            ) : (
              <bdi>{value}</bdi>
            )
          ) : (
            <span className="text-slate-300 font-normal">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function AttachmentRow({
  file,
  onPreview,
}: {
  file: ClientRecord["attachments"][number];
  onPreview: () => void;
}) {
  const isImage = file.type.startsWith("image/");

  return (
    <li className="group flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={file.dataUrl}
          download={file.name}
          title="تنزيل"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={onPreview}
          title="معاينة"
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onPreview}
        className="flex items-center gap-2 min-w-0 flex-1 text-right"
      >
        {isImage ? (
          <img
            src={file.dataUrl}
            alt=""
            className="w-9 h-9 rounded-md object-cover shrink-0 border border-slate-200"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              file.type === "application/pdf"
                ? "bg-rose-100 text-rose-600"
                : "bg-brand-50 text-brand-600"
            }`}
          >
            {file.type === "application/pdf" ? (
              <FileText className="w-4 h-4" />
            ) : (
              <FileType className="w-4 h-4" />
            )}
          </div>
        )}
        <div className="text-right min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-700 truncate group-hover:text-brand-700" title={file.name}>
            {file.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {formatSize(file.size)}
          </div>
        </div>
      </button>
    </li>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
