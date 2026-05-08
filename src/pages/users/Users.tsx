import { Link } from "react-router-dom";
import { Plus, Users as UsersIcon, Search } from "lucide-react";

const columns = ["إجراءات", "الحالة", "الدور", "البريد", "الجوال", "الاسم", "رقم المستخدم"];

export default function Users() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/users/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          إضافة مستخدم
        </Link>
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          المستخدمون
          <UsersIcon className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="ابحث بالاسم، رقم المستخدم، البريد..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <select className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right">
            <option>كل الأدوار</option>
          </select>
          <select className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right">
            <option>كل الحالات</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-right whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <UsersIcon className="w-12 h-12 mb-3" strokeWidth={1.2} />
                    <span className="text-sm">لا يوجد مستخدمون</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
