import { useState } from "react";
import { BarChart3, Download, FileDown } from "lucide-react";

const ranges = ["مخصص", "هذا العام", "هذا الربع", "هذا الشهر", "هذا الأسبوع", "اليوم"];

export default function ReportsHeader() {
  const [range, setRange] = useState("هذا الشهر");

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm font-bold shadow hover:bg-violet-600">
            <FileDown className="w-4 h-4" />
            تصدير التويب الحالي
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-600">
            <Download className="w-4 h-4" />
            تصدير شامل
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-card">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  range === r
                    ? "bg-brand-500 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold">
            هذا الشهر 05-2026
          </span>
        </div>

        <div className="text-right">
          <h2 className="flex items-center justify-end gap-2 text-xl font-extrabold text-slate-800">
            الإحصائيات والتقارير
            <BarChart3 className="w-6 h-6 text-brand-500" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تحليل شامل للطلبات والقضايا والعملاء والمدفوعات
          </p>
        </div>
      </div>
    </div>
  );
}
