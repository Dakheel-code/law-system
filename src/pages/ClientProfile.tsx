import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Hash,
  Globe,
  Briefcase,
  FileText,
  Edit3,
  Trash2,
  Download,
  Image as ImageIcon,
  FileType,
  Calendar,
  StickyNote,
  Plus,
  Folder,
  CalendarClock,
} from "lucide-react";
import { useClients, deleteClient, type ClientRecord } from "../lib/clientStore";
import { nationalities } from "../config/nationalities";

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

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const clients = useClients();
  const navigate = useNavigate();

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
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100">
            <Edit3 className="w-4 h-4" />
            تعديل
          </button>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للقائمة
        </Link>
      </div>

      {/* Header card */}
      <div className="card relative overflow-hidden">
        <div className="h-24 bg-gradient-to-l from-brand-700 to-brand-500" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                {clientTypeLabels[client.clientType] ?? client.clientType}
              </span>
              <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-bold">
                {contractTypeLabels[client.contractType] ?? client.contractType}
              </span>
              <span className="text-xs text-slate-500 font-mono">{client.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-xl font-extrabold text-slate-800">{client.fullName}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  مسجّل منذ {new Date(client.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-brand-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Briefcase} label="القضايا" value="0" color="text-sky-600 bg-sky-50" />
        <Stat icon={FileText} label="الطلبات" value="0" color="text-violet-600 bg-violet-50" />
        <Stat icon={CalendarClock} label="الجلسات" value="0" color="text-emerald-600 bg-emerald-50" />
        <Stat
          icon={Folder}
          label="المرفقات"
          value={String(client.attachments.length)}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personal info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              المعلومات الشخصية
              <UserIcon className="w-4 h-4 text-brand-500" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Hash} label="رقم الهوية" value={client.idNumber} />
              <InfoItem icon={Globe} label="الجنسية" value={nationalityLabel} />
              <InfoItem
                icon={Phone}
                label="رقم الهاتف"
                value={client.phone}
                ltr
              />
              <InfoItem
                icon={Mail}
                label="البريد الإلكتروني"
                value={client.email}
                ltr
              />
              <InfoItem icon={Calendar} label="تاريخ التسجيل" value={
                new Date(client.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              } />
              <InfoItem
                icon={MapPin}
                label="نوع العميل"
                value={clientTypeLabels[client.clientType] ?? client.clientType}
              />
            </div>
          </div>

          {/* Linked cases */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <Link
                to={`/cases/new?clientId=${client.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600"
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
              <Briefcase className="w-12 h-12 mb-3" strokeWidth={1.2} />
              <p className="text-sm text-slate-500">لا توجد قضايا مرتبطة بهذا العميل</p>
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
            <div className="card p-5">
              <h2 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                ملاحظات
                <StickyNote className="w-4 h-4 text-brand-500" />
              </h2>
              <p className="text-sm text-slate-600 leading-7 text-right whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Attachments sidebar */}
        <div className="space-y-5">
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
                  <AttachmentRow key={i} file={f} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-xs text-slate-500">{label}</div>
        <div
          className={`text-sm font-medium text-slate-800 mt-0.5 truncate ${
            ltr ? "text-left" : ""
          }`}
          dir={ltr ? "ltr" : undefined}
          title={value}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function AttachmentRow({ file }: { file: ClientRecord["attachments"][number] }) {
  const isImage = file.type.startsWith("image/");

  return (
    <li className="group flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
      <a
        href={file.dataUrl}
        download={file.name}
        title="تنزيل"
        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md shrink-0"
      >
        <Download className="w-4 h-4" />
      </a>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="text-right min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-700 truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {formatSize(file.size)}
          </div>
        </div>
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
            ) : isImage ? (
              <ImageIcon className="w-4 h-4" />
            ) : (
              <FileType className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
