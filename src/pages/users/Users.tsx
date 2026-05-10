import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Users as UsersIcon,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Edit3,
} from "lucide-react";
import { useUsers, deleteUser, updateUser, type UserRecord } from "../../lib/userStore";
import { userTypes } from "../../config/userConfig";

const columns = [
  "رقم المستخدم",
  "الاسم",
  "الجوال",
  "البريد",
  "الدور",
  "الحالة",
  "إجراءات",
];

export default function Users() {
  const users = useUsers();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const typeLabel = (key: string) =>
    userTypes.find((t) => t.value === key)?.label ?? key;

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.idNumber.includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }
    if (roleFilter) list = list.filter((u) => u.type === roleFilter);
    if (statusFilter) list = list.filter((u) => u.status === statusFilter);
    return list;
  }, [users, search, roleFilter, statusFilter]);

  const handleDelete = (u: UserRecord) => {
    if (confirm(`حذف المستخدم "${u.fullName}"؟`)) deleteUser(u.id);
  };

  const toggleStatus = (u: UserRecord) => {
    updateUser(u.id, { status: u.status === "active" ? "inactive" : "active" });
  };

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
          <span className="text-sm font-normal text-slate-500">
            ({users.length})
          </span>
          <UsersIcon className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، رقم المستخدم، البريد..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right"
          >
            <option value="">كل الأدوار</option>
            {userTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">معطّل</option>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <UsersIcon className="w-12 h-12 mb-3" strokeWidth={1.2} />
                      <span className="text-sm">
                        {users.length === 0
                          ? "لا يوجد مستخدمون"
                          : "لا توجد نتائج مطابقة"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono text-slate-500">{u.id}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatarDataUrl ? (
                            <img
                              src={u.avatarDataUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-4 h-4 text-brand-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      <bdi dir="ltr">{u.phone || "—"}</bdi>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      <bdi dir="ltr">{u.email || "—"}</bdi>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">
                      {typeLabel(u.type)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.status === "active" ? "نشط" : "معطّل"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/users/${u.id}/edit`)}
                          title="تعديل"
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(u)}
                          title={u.status === "active" ? "تعطيل" : "تفعيل"}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md"
                        >
                          {u.status === "active" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          title="حذف"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
