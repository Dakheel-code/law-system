import { Users, RefreshCw } from "lucide-react";

export default function ClientsEmpty() {
  return (
    <div className="card flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-violet-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-700">لا توجد نتائج</h3>
      <p className="text-sm text-slate-400 mt-1">
        حاول تعديل معايير البحث أو مسح الفلاتر
      </p>
      <button className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600">
        <RefreshCw className="w-4 h-4" />
        مسح الفلاتر
      </button>
    </div>
  );
}
