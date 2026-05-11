import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Scale, User as UserIcon, Trophy } from "lucide-react";
import { useUsers } from "../../lib/userStore";
import { useCases } from "../../lib/caseStore";
import { useTasks } from "../../lib/taskStore";

type Row = {
  id: string;
  name: string;
  avatar: string | null;
  cases: number;
  activeCases: number;
  tasks: number;
};

export default function LawyersStats() {
  const { users } = useUsers();
  const { cases } = useCases();
  const { tasks } = useTasks();

  const lawyers = useMemo(
    () => users.filter((u) => u.type === "lawyer" && u.status === "active"),
    [users]
  );

  const rows: Row[] = useMemo(() => {
    return lawyers
      .map((u) => {
        const myCases = cases.filter((c) => c.assignedLawyer === u.id);
        const myTasks = tasks.filter(
          (t) => t.assignedTo === u.id && !t.archived
        );
        return {
          id: u.id,
          name: u.fullName || "بدون اسم",
          avatar: u.avatarDataUrl,
          cases: myCases.length,
          activeCases: myCases.filter((c) => c.status === "active").length,
          tasks: myTasks.length,
        };
      })
      .sort((a, b) => b.cases + b.tasks - (a.cases + a.tasks))
      .slice(0, 5);
  }, [lawyers, cases, tasks]);

  const maxLoad = Math.max(1, ...rows.map((r) => r.cases + r.tasks));

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
        <Link
          to="/users"
          className="text-xs text-brand-600 hover:text-brand-700 font-bold"
        >
          كل المحامين ←
        </Link>
        <div className="text-right">
          <h3 className="flex items-center justify-start gap-2 text-sm font-bold text-slate-800">
            المحامون
            <Scale className="w-4 h-4 text-brand-500" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lawyers.length} محامي نشط · ترتيب حسب الحمل
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Scale className="w-10 h-10 mb-2" strokeWidth={1.2} />
          <p className="text-xs text-slate-500">لا يوجد محامون مسجّلون</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => {
            const total = r.cases + r.tasks;
            const pct = (total / maxLoad) * 100;
            const isTop = i === 0 && total > 0;
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="relative shrink-0">
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center ring-2 ring-white">
                      <UserIcon className="w-5 h-5 text-brand-600" />
                    </div>
                  )}
                  {isTop && (
                    <span
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white"
                      title="الأعلى حملاً"
                    >
                      <Trophy className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-right min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-700 truncate">
                        {r.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {r.cases} قضية ({r.activeCases} نشطة) · {r.tasks} مهمة
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-extrabold text-slate-800 leading-none">
                        <bdi dir="ltr">{total}</bdi>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">إجمالي</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isTop ? "bg-amber-400" : "bg-brand-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
