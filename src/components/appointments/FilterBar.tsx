import { RotateCcw, Search } from "lucide-react";

export default function FilterBar() {
  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div className="lg:col-span-1 flex justify-end">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100">
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
            بحث
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="بحث..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>

        <FilterSelect label="المحامي/الموظف" placeholder="الكل" />
        <FilterSelect label="الحالة" placeholder="الكل" />
        <FilterSelect label="الفترة" placeholder="هذا الشهر" />
        <FilterSelect label="النوع" placeholder="الكل" />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-4 text-xs text-slate-500 flex-wrap">
        <Legend color="bg-violet-500" label="مهام" />
        <Legend color="bg-rose-500" label="عقود زواج" />
        <Legend color="bg-orange-500" label="كتابة عدل" />
        <Legend color="bg-amber-500" label="استشارات" />
        <Legend color="bg-emerald-500" label="جلسات" />
        <span className="font-bold text-slate-600">أنواع المواعيد:</span>
      </div>
    </div>
  );
}

function FilterSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        {label}
      </label>
      <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-200 text-right">
        <option>{placeholder}</option>
      </select>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span className={`w-2 h-2 rounded-full ${color}`} />
    </span>
  );
}
