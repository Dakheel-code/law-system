import { Link } from "react-router-dom";
import { Plus, SlidersHorizontal, Search } from "lucide-react";

export default function ClientsToolbar() {
  return (
    <div className="flex flex-col lg:flex-row-reverse items-stretch lg:items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="ابحث بالاسم، رقم الهوية، الهاتف، البريد..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-card hover:bg-slate-50">
        <SlidersHorizontal className="w-4 h-4" />
        فلاتر
      </button>

      <Link
        to="/clients/new"
        className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold shadow-card hover:bg-brand-600"
      >
        <Plus className="w-4 h-4" />
        عميل جديد
      </Link>
    </div>
  );
}
