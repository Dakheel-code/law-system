import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Gavel, Video, MapPin, Clock, Building2 } from "lucide-react";
import { useCases } from "../../lib/caseStore";
import { toLocalISO } from "../../lib/hijri";

type Row = {
  id: string;
  caseId: string;
  caseTitle: string;
  caseCode: string;
  caseNumber: string;
  date: string;
  time: string;
  court: string;
  location: string;
  mode: "in-person" | "online";
  isToday: boolean;
};

const MAX_ROWS = 6;

export default function UpcomingSessions() {
  const { cases } = useCases();
  const today = toLocalISO(new Date());

  const upcoming = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    for (const c of cases) {
      for (const s of c.sessions ?? []) {
        if (!s.date || s.date < today) continue;
        rows.push({
          id: s.id,
          caseId: c.id,
          caseTitle: c.requestTitle || c.code,
          caseCode: c.code,
          caseNumber: c.caseNumber ?? "",
          date: s.date,
          time: s.time ?? "",
          court: s.court ?? "",
          location: s.location ?? "",
          mode: s.mode,
          isToday: s.date === today,
        });
      }
    }
    return rows
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, MAX_ROWS);
  }, [cases, today]);

  const todayCount = upcoming.filter((r) => r.isToday).length;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <Link
          to="/sessions"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          الكل ←
        </Link>
        <div className="text-right">
          <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
            الجلسات القادمة
            <Gavel className="w-4 h-4 text-brand-500" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {todayCount > 0
              ? `${todayCount} اليوم`
              : upcoming.length === 0
              ? "لا توجد جلسات قادمة"
              : `أقرب ${upcoming.length}`}
          </p>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Gavel className="w-10 h-10 mb-2" strokeWidth={1.2} />
          <p className="text-xs text-slate-500">لا توجد جلسات قادمة</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((r) => (
            <SessionRow key={`${r.caseId}-${r.id}`} row={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionRow({ row: r }: { row: Row }) {
  const isOnline = r.mode === "online";
  const ModeIcon = isOnline ? Video : MapPin;
  const d = new Date(r.date);
  const dayNum = d.toLocaleDateString("ar-EG-u-nu-latn", { day: "2-digit" });
  const monthName = d.toLocaleDateString("ar-EG-u-nu-latn", { month: "short" });
  const weekday = d.toLocaleDateString("ar-EG-u-nu-latn", { weekday: "short" });

  return (
    <li
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition ${
        r.isToday
          ? "border-brand-300 bg-brand-50/40"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      {/* Date pill */}
      <div
        className={`shrink-0 w-12 rounded-lg flex flex-col items-center py-1.5 ${
          r.isToday
            ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow"
            : "bg-white text-slate-700 border border-slate-200"
        }`}
      >
        <div className="text-[9px] font-bold opacity-90">
          {r.isToday ? "اليوم" : weekday}
        </div>
        <div className="text-base font-extrabold leading-none my-0.5">
          <bdi dir="ltr">{dayNum}</bdi>
        </div>
        <div className="text-[9px] opacity-90">{monthName}</div>
      </div>

      {/* Main info */}
      <Link
        to={`/cases/${r.caseId}`}
        className="flex-1 min-w-0 text-right group"
      >
        <div className="flex items-center justify-start gap-1.5 mb-0.5">
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
          {r.time && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500">
              <Clock className="w-2.5 h-2.5" />
              <bdi dir="ltr">{r.time}</bdi>
            </span>
          )}
        </div>
        <div
          className="text-xs font-bold text-slate-700 truncate group-hover:text-brand-700"
          title={r.caseTitle}
        >
          {r.caseTitle}
        </div>
        {(r.court || r.location) && (
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-start gap-1 truncate">
            <Building2 className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{r.court || r.location}</span>
          </div>
        )}
      </Link>
    </li>
  );
}
