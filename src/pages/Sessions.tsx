import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gavel,
  Plus,
  Calendar,
  Clock,
  Search,
  CalendarX2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCases, removeSession, type CaseSession } from "../lib/caseStore";
import { useClients } from "../lib/clientStore";
import SessionFormModal from "../components/sessions/SessionFormModal";
import SessionCard from "../components/sessions/SessionCard";
import { toLocalISO } from "../lib/hijri";

type EnrichedSession = CaseSession & {
  caseId: string;
  caseCode: string;
  caseNumber: string;       // رقم القضية في المحكمة
  caseTitle: string;        // عنوان القضية
  clientName: string;       // اسم العميل
  partyNames: string[];     // أسماء الأطراف
};

const todayStr = () => toLocalISO(new Date());

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
  const { clients } = useClients();
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

  const clientById = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  // Flatten sessions from all cases
  const allSessions = useMemo<EnrichedSession[]>(() => {
    const list: EnrichedSession[] = [];
    cases.forEach((c) => {
      const client = c.clientId ? clientById.get(c.clientId) : null;
      const clientName = client?.fullName || "";
      const partyNames = (c.parties ?? [])
        .map((p) => p.name)
        .filter((n) => n && n.trim());
      // Legacy single-opponent fallback
      if (partyNames.length === 0 && c.otherPartyName) {
        partyNames.push(c.otherPartyName);
      }
      (c.sessions ?? []).forEach((s) => {
        list.push({
          ...s,
          caseId: c.id,
          caseCode: c.code,
          caseNumber: c.caseNumber ?? "",
          caseTitle: c.requestTitle || c.code,
          clientName,
          partyNames,
        });
      });
    });
    return list.sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    );
  }, [cases, clientById]);

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
          s.clientName,
          ...s.partyNames,
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
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((s) => (
            <SessionCard
              key={`${s.caseId}-${s.id}`}
              session={s}
              caseTitle={s.caseTitle}
              caseCode={s.caseCode}
              caseNumber={s.caseNumber}
              clientName={s.clientName}
              partyNames={s.partyNames}
              today={t}
              onOpen={() => navigate(`/sessions/${s.caseId}/${s.id}`)}
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

