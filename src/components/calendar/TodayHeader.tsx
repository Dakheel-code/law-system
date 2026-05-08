import { Calendar } from "lucide-react";
import { hijriFull, gregFull } from "../../lib/hijri";

export default function TodayHeader() {
  const today = new Date();
  return (
    <div className="rounded-2xl bg-rose-50/40 border-2 border-rose-100 p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="text-right">
        <div className="text-xs text-slate-500">التاريخ الميلادي</div>
        <div className="text-sm font-bold text-slate-700 mt-0.5">{gregFull(today)}</div>
      </div>

      <div className="flex items-center gap-3 text-right">
        <div>
          <div className="text-xs text-slate-500">التاريخ الهجري اليوم</div>
          <div className="text-base font-extrabold text-rose-600 mt-0.5">
            {hijriFull(today)} هـ
          </div>
        </div>
        <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-rose-500" />
        </span>
      </div>
    </div>
  );
}
