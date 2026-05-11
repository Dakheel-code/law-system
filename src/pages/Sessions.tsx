import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gavel,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Link as LinkIcon,
  Trash2,
  Edit3,
  Search,
  Building2,
  Eye,
  CalendarX2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCases, removeSession, type CaseSession } from "../lib/caseStore";
import SessionFormModal from "../components/sessions/SessionFormModal";

type EnrichedSession = CaseSession & {
  caseId: string;
  caseCode: string;
  caseNumber: string;
  caseTitle: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Sessions() {
  const { cases, loading } = useCases();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming");
  const [modeFilter, setModeFilter] = useState<"all" | "in-person" | "online">(
    "all"
  );
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<{
    caseId: string;
    session: CaseSession;
  } | null>(null);

  // Flatten sessions from all cases
  const allSessions = useMemo<EnrichedSession[]>(() => {
    const list: EnrichedSession[] = [];
    cases.forEach((c) => {
      (c.sessions ?? []).forEach((s) => {
        list.push({
          ...s,
          caseId: c.id,
          caseCode: c.code,
          caseNumber: c.caseNumber ?? "",
          caseTitle: c.requestTitle || c.code,
        });
      });
    });
    return list.sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    );
  }, [cases]);

  const t = todayStr();
  const upcomingCount = allSessions.filter((s) => s.date >= t).length;
  const todayCount = allSessions.filter((s) => s.date === t).length;
  const pastCount = allSessions.filter((s) => s.date < t).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSessions.filter((s) => {
      if (scope === "upcoming" && s.date < t) return false;
      if (scope === "past" && s.date >= t) return false;
      if (modeFilter !== "all" && s.mode !== modeFilter) return false;
      if (q) {
        const hay = [
          s.caseTitle,
          s.caseCode,
          s.caseNumber,
          s.court,
          s.location,
          s.details,
          s.link,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allSessions, search, scope, modeFilter, t]);

  const handleDelete = async (sess: EnrichedSession) => {
    if (
      !confirm(
        `هل تريد حذف الجلسة بتاريخ ${fmtDate(sess.date)} من قضية «${sess.caseTitle}»؟`
      )
    )
      return;
    await removeSession(sess.caseId, sess.id);
  };

  const onReset = () => {
    setSearch("");
    setScope("upcoming");
    setModeFilter("all");
  };
  const hasFilters =
    search !== "" || scope !== "upcoming" || modeFilter !== "all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          الجلسات
          <Gavel className="w-5 h-5 text-brand-500" />
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setOpenModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          إضافة جلسة
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi
          title="إجمالي الجلسات"
          value={allSessions.length}
          icon={Gavel}
          color="bg-brand-500"
        />
        <Kpi
          title="القادمة"
          value={upcomingCount}
          icon={Calendar}
          color="bg-sky-500"
        />
        <Kpi
          title="اليوم"
          value={todayCount}
          icon={Clock}
          color="bg-violet-500"
        />
        <Kpi
          title="السابقة"
          value={pastCount}
          icon={CheckCircle2}
          color="bg-slate-500"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onReset}
          disabled={!hasFilters}
          className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين
        </button>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {[
            { key: "upcoming", label: "القادمة" },
            { key: "all", label: "الكل" },
            { key: "past", label: "السابقة" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setScope(s.key as typeof scope)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                scope === s.key
                  ? "bg-brand-500 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {[
            { key: "all", label: "الكل" },
            { key: "in-person", label: "حضوري" },
            { key: "online", label: "أون لاين" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setModeFilter(m.key as typeof modeFilter)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                modeFilter === m.key
                  ? "bg-brand-500 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في عنوان القضية، المحكمة، أو التفاصيل..."
            className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="text-xs text-amber-600 text-right">
          النتائج: <bdi dir="ltr">{filtered.length}</bdi> من{" "}
          <bdi dir="ltr">{allSessions.length}</bdi>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="card p-16 text-center text-sm text-slate-400">
          جارٍ التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          {allSessions.length === 0 ? (
            <>
              <CalendarX2
                className="w-14 h-14 text-slate-300 mb-3"
                strokeWidth={1.2}
              />
              <h3 className="text-base font-bold text-slate-700">
                لا توجد جلسات بعد
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-5">
                ابدأ بإضافة جلسة وربطها بقضية موجودة
              </p>
              <button
                onClick={() => {
                  setEditing(null);
                  setOpenModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
              >
                <Plus className="w-4 h-4" />
                إضافة الجلسة الأولى
              </button>
            </>
          ) : (
            <>
              <AlertCircle className="w-14 h-14 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">
                لا توجد جلسات مطابقة للفلاتر
              </h3>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <SessionRow
              key={`${s.caseId}-${s.id}`}
              session={s}
              today={t}
              onOpenCase={() => navigate(`/cases/${s.caseId}`)}
              onEdit={() => {
                setEditing({ caseId: s.caseId, session: s });
                setOpenModal(true);
              }}
              onDelete={() => handleDelete(s)}
            />
          ))}
        </ul>
      )}

      {openModal && (
        <SessionFormModal
          initialCaseId={editing?.caseId}
          initialSession={editing?.session}
          onClose={() => {
            setOpenModal(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Components
// ============================================================

function Kpi({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div
        className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-extrabold text-slate-800 mt-0.5">
          <bdi dir="ltr">{value}</bdi>
        </div>
      </div>
    </div>
  );
}

function SessionRow({
  session: s,
  today,
  onOpenCase,
  onEdit,
  onDelete,
}: {
  session: EnrichedSession;
  today: string;
  onOpenCase: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOnline = s.mode === "online";
  const isPast = s.date < today;
  const isToday = s.date === today;

  const wrapperCls = isToday
    ? "border-brand-300 bg-brand-50/40"
    : isPast
    ? "border-slate-200 bg-slate-50/30 opacity-80"
    : isOnline
    ? "border-violet-200 bg-violet-50/30"
    : "border-sky-200 bg-sky-50/30";

  const modeChipCls = isOnline
    ? "bg-violet-500 text-white"
    : "bg-sky-500 text-white";
  const ModeIcon = isOnline ? Video : MapPin;

  const dayLabel = isToday
    ? "اليوم"
    : new Date(s.date).toLocaleDateString("ar-EG-u-nu-latn", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });

  return (
    <li className={`rounded-xl border p-4 ${wrapperCls}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onDelete}
            title="حذف"
            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            title="تعديل"
            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenCase}
            title="فتح القضية"
            className="p-1.5 text-brand-600 hover:bg-brand-100 rounded-md"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right flex-1 min-w-0">
          <div className="flex items-center justify-start gap-2 mb-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${modeChipCls}`}
            >
              <ModeIcon className="w-3 h-3" />
              {isOnline ? "أون لاين" : "حضوري"}
            </span>
            {isToday && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500 text-white">
                اليوم
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                سابقة
              </span>
            )}
          </div>
          <Link
            to={`/cases/${s.caseId}`}
            className="text-base font-bold text-slate-800 hover:text-brand-700 truncate block"
          >
            {s.caseTitle}
          </Link>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono" dir="ltr">
            {s.caseNumber ? `${s.caseNumber} · ${s.caseCode}` : s.caseCode}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-slate-700 flex items-center justify-start gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <bdi dir="rtl">{dayLabel}</bdi>
          </div>
          {s.time && (
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-start gap-1.5">
              <Clock className="w-3 h-3" />
              <bdi dir="ltr">{s.time}</bdi>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/60 text-sm">
        {s.court && (
          <Row icon={Building2} label="المحكمة" value={s.court} />
        )}
        {isOnline && s.link ? (
          <RowLink icon={LinkIcon} label="الرابط" value={s.link} />
        ) : (
          !isOnline &&
          s.location && <Row icon={MapPin} label="المكان" value={s.location} />
        )}
      </div>

      {s.details && (
        <div className="mt-3 pt-3 border-t border-white/60 text-xs text-slate-600 leading-6 text-right whitespace-pre-line">
          {s.details}
        </div>
      )}
    </li>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-end gap-1.5 text-slate-700">
      <span className="flex-1 text-right truncate" title={value}>
        {value}
      </span>
      <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}:
      </span>
    </div>
  );
}

function RowLink({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-end gap-1.5 text-slate-700 min-w-0">
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-left truncate text-brand-600 hover:text-brand-700 underline"
        dir="ltr"
      >
        {value}
      </a>
      <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}:
      </span>
    </div>
  );
}
