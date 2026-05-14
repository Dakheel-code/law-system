// SessionCard — single source of truth for session card visuals.
//
// Used in:
//   • /sessions  (Sessions list page)
//   • /cases/:id (Case detail → "الجلسات" tab)
//
// Any future visual tweak should happen ONLY here and will propagate to
// every place that renders sessions.
//
// Props:
//   session       — the CaseSession object
//   caseTitle     — case display title (e.g. requestTitle or code)
//   caseCode      — CSE-XXXXX
//   caseNumber    — court case number (optional)
//   clientName    — client full name (optional)
//   partyNames    — list of party names to display (optional)
//   today         — YYYY-MM-DD; used to derive today/past styling. Optional;
//                   if omitted, computed via toLocalISO(new Date()).
//   showStatus    — show the session status chip when available (default true)
//   onOpen        — click handler for the whole card + eye button
//   onEdit        — edit button click (renders only if provided)
//   onDelete      — delete button click (renders only if provided)

import {
  Building2,
  Clock,
  Edit3,
  Eye,
  Hash,
  Link as LinkIcon,
  MapPin,
  Trash2,
  User as UserIcon,
  Users as UsersIcon,
  Video,
} from "lucide-react";
import type { CaseSession } from "../../lib/caseStore";
import { toLocalISO } from "../../lib/hijri";

const sessionStatusStyles: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "مجدّولة", cls: "bg-sky-100 text-sky-700" },
  held: { label: "انعقدت", cls: "bg-emerald-100 text-emerald-700" },
  postponed: { label: "مؤجّلة", cls: "bg-amber-100 text-amber-700" },
  cancelled: { label: "ملغاة", cls: "bg-rose-100 text-rose-700" },
};

type Props = {
  session: CaseSession;
  caseTitle?: string;
  caseCode?: string;
  caseNumber?: string;
  clientName?: string;
  partyNames?: string[];
  today?: string;
  showStatus?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function SessionCard({
  session: s,
  caseTitle,
  caseCode,
  caseNumber,
  clientName,
  partyNames = [],
  today,
  showStatus = true,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const isOnline = s.mode === "online";
  const t = today ?? toLocalISO(new Date());
  const isPast = !!s.date && s.date < t;
  const isToday = s.date === t;

  const ModeIcon = isOnline ? Video : MapPin;
  const statusInfo =
    showStatus && s.status ? sessionStatusStyles[s.status] : null;

  // Date column styling — colored pill that conveys state at a glance
  const dateTone = isToday
    ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md"
    : isPast
    ? "bg-slate-100 text-slate-500 border border-slate-200"
    : "bg-white text-slate-700 border border-slate-200";

  // Card border accent
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

  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const hasActions = !!(onOpen || onEdit || onDelete);

  return (
    <li
      onClick={onOpen}
      className={`card p-3 transition ${
        onOpen ? "cursor-pointer hover:shadow-md" : ""
      } ${cardCls}`}
    >
      {/* Top row: date pill + time pill + badges + actions */}
      <div className="flex items-start gap-2 mb-3">
        {/* Date pill */}
        <div
          className={`shrink-0 w-14 rounded-lg flex flex-col items-center py-1.5 ${dateTone}`}
        >
          <div className="text-[9px] font-bold opacity-90">
            {isToday ? "اليوم" : weekday}
          </div>
          <div className="text-xl font-extrabold leading-none my-0.5">
            <bdi dir="ltr">{dayNum}</bdi>
          </div>
          <div className="text-[9px] opacity-90">{monthName}</div>
        </div>

        {/* Time pill — mirrors the date pill shape */}
        {s.time && (
          <div
            className="shrink-0 w-14 rounded-lg flex flex-col items-center py-1.5 bg-slate-50 text-slate-700 border border-slate-200"
            title="وقت الجلسة"
          >
            <Clock className="w-3 h-3 text-slate-400 mb-0.5" />
            <div
              className="text-sm font-extrabold leading-none font-mono"
              dir="ltr"
            >
              {s.time}
            </div>
            <div className="text-[9px] opacity-80 mt-0.5">الوقت</div>
          </div>
        )}

        {/* Badges */}
        <div className="flex-1 min-w-0 flex items-start justify-start gap-1 flex-wrap">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
              isOnline
                ? "bg-violet-100 text-violet-700"
                : "bg-sky-100 text-sky-700"
            }`}
            title={isOnline ? "أون لاين" : "حضوري"}
          >
            <ModeIcon className="w-3.5 h-3.5" />
          </span>
          {isToday && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-100 text-brand-700">
              اليوم
            </span>
          )}
          {isPast && !statusInfo && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600">
              منتهية
            </span>
          )}
          {statusInfo && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>

        {/* Actions (compact) */}
        {hasActions && (
          <div className="shrink-0 flex items-center gap-0.5">
            {onOpen && (
              <button
                type="button"
                onClick={stop(onOpen)}
                title="فتح الجلسة"
                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={stop(onEdit)}
                title="تعديل"
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={stop(onDelete)}
                title="حذف"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Case title (if provided) */}
      {caseTitle && (
        <div
          className="block text-sm font-bold text-slate-800 truncate text-right"
          title={caseTitle}
        >
          {caseTitle}
        </div>
      )}

      {/* Case + session identifiers */}
      {(caseNumber || caseCode || s.sessionNumber) && (
        <div
          className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono flex-wrap"
          dir="ltr"
        >
          {caseNumber && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700"
              title="رقم القضية في المحكمة"
            >
              <Hash className="w-2.5 h-2.5" />
              {caseNumber}
            </span>
          )}
          {caseCode && <span className="text-slate-400">{caseCode}</span>}
          {s.sessionNumber && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700"
              title="رقم الجلسة"
            >
              <Hash className="w-2.5 h-2.5" />
              {s.sessionNumber}
            </span>
          )}
        </div>
      )}

      {/* Client + parties */}
      {(clientName || partyNames.length > 0) && (
        <div className="mt-2 space-y-1">
          {clientName && (
            <InfoLine icon={UserIcon} label="العميل" value={clientName} />
          )}
          {partyNames.length > 0 && (
            <InfoLine
              icon={UsersIcon}
              label={partyNames.length > 1 ? "الأطراف" : "الطرف"}
              value={partyNames.join("، ")}
            />
          )}
        </div>
      )}

      {/* Info rows */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1">
        {s.court && (
          <InfoLine icon={Building2} label="المحكمة" value={s.court} />
        )}
        {s.circuit && (
          <InfoLine icon={Building2} label="الدائرة" value={s.circuit} />
        )}
        {!isOnline && s.location && (
          <InfoLine icon={MapPin} label="المكان" value={s.location} />
        )}
        {isOnline && s.link && (
          <InfoLine
            icon={LinkIcon}
            label="الرابط"
            value={s.link}
            href={s.link}
          />
        )}
        {!s.court && !s.circuit && !s.location && !s.link && (
          <div className="text-[10px] text-slate-400 text-right">
            لا توجد تفاصيل مكان
          </div>
        )}
      </div>

      {/* Details */}
      {s.details && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-right">
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

function InfoLine({
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
          onClick={(e) => e.stopPropagation()}
          className="font-bold text-brand-600 hover:text-brand-700 underline truncate text-left"
          dir="ltr"
          title={value}
        >
          {value}
        </a>
      ) : (
        <span className="font-bold text-slate-700 truncate" title={value}>
          {value}
        </span>
      )}
    </div>
  );
}
