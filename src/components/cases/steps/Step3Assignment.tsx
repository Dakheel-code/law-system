import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  X,
  Check,
  Search,
  Scale,
  User as UserIcon,
  Edit3,
} from "lucide-react";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { useUsers, type UserRecord } from "../../../lib/userStore";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step3Assignment({ data, update }: Props) {
  const { users, loading } = useUsers();
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const candidates = users.filter(
    (u) =>
      u.status === "active" &&
      (u.type === "lawyer" || u.type === "manager" || u.type === "supervisor")
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const selectedUsers = users.filter((u) => data.assignedLawyers.includes(u.id));

  const toggle = (id: string) => {
    const next = data.assignedLawyers.includes(id)
      ? data.assignedLawyers.filter((x) => x !== id)
      : [...data.assignedLawyers, id];
    update("assignedLawyers", next);
    update("assignedLawyer", next[0] ?? "");
  };
  const remove = (id: string) => {
    const next = data.assignedLawyers.filter((x) => x !== id);
    update("assignedLawyers", next);
    update("assignedLawyer", next[0] ?? "");
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="إسناد القضية"
        subtitle="عيِّن محامياً واحداً أو أكثر للعمل على هذه القضية"
      />

      {/* Selected lawyers */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-md"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {open ? "إخفاء" : selectedUsers.length > 0 ? "تعديل" : "اختيار محامين"}
          </button>
          <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-700">
            المحامون المعيَّنون
            <span className="text-slate-400 font-normal text-sm">
              ({selectedUsers.length})
            </span>
            <Scale className="w-4 h-4 text-brand-500" />
          </h3>
        </div>

        {selectedUsers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
            <Scale
              className="w-10 h-10 text-slate-300 mx-auto mb-2"
              strokeWidth={1.4}
            />
            <p className="text-sm text-slate-500">
              لم يتم تعيين محامي للقضية بعد — اختر من القائمة أدناه
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedUsers.map((u, i) => (
              <li
                key={u.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-brand-200 bg-brand-50/40"
              >
                <button
                  type="button"
                  onClick={() => remove(u.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md shrink-0"
                  title="إزالة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {i === 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded shrink-0">
                    أساسي
                  </span>
                )}
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-bold text-slate-800 truncate">
                    {u.fullName || u.code}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {u.type === "lawyer"
                      ? "محامي"
                      : u.type === "manager"
                      ? "مدير"
                      : u.type === "supervisor"
                      ? "مشرف"
                      : u.type}
                    {u.email && <> · <bdi dir="ltr">{u.email}</bdi></>}
                  </div>
                </div>
                {u.avatarDataUrl ? (
                  <img
                    src={u.avatarDataUrl}
                    alt={u.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shrink-0">
                    {(u.firstName?.[0] || u.fullName?.[0] || "؟").toUpperCase()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Picker list */}
      {open && (
        <div className="border-t border-dashed border-slate-200 pt-5">
          <h4 className="text-sm font-bold text-slate-700 text-right mb-3">
            اختر من قائمة المحامين
          </h4>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-2 border-b border-slate-100 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الكود..."
                className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="text-center text-xs text-slate-400 py-8">
                  جارٍ التحميل...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">
                  لا يوجد محامون مطابقون
                </div>
              ) : (
                filtered.map((u) => {
                  const sel = data.assignedLawyers.includes(u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggle(u.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition ${
                        sel ? "bg-brand-50/60" : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          sel
                            ? "bg-brand-500 border-brand-500"
                            : "border-slate-300"
                        }`}
                      >
                        {sel && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <Avatar user={u} />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-sm font-bold text-slate-700 truncate">
                          {u.fullName || u.code}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 justify-end">
                          {u.type && (
                            <span>
                              {u.type === "lawyer"
                                ? "محامي"
                                : u.type === "manager"
                                ? "مدير"
                                : u.type === "supervisor"
                                ? "مشرف"
                                : u.type}
                            </span>
                          )}
                          {u.email && (
                            <bdi dir="ltr" className="font-mono">
                              {u.email}
                            </bdi>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
              <span className="text-slate-500">
                {data.assignedLawyers.length} مختار من{" "}
                <bdi dir="ltr">{candidates.length}</bdi>
              </span>
              <button
                type="button"
                onClick={() => {
                  update("assignedLawyers", []);
                  update("assignedLawyer", "");
                }}
                disabled={data.assignedLawyers.length === 0}
                className="text-rose-500 hover:text-rose-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 flex items-start gap-2">
        <UsersIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-right flex-1 leading-6">
          المحامي الأول في القائمة يُعدّ <strong>المحامي الأساسي</strong>{" "}
          للقضية. يمكنك إعادة الترتيب لاحقاً بإزالة المحامي وإضافته من جديد.
        </p>
      </div>
    </div>
  );
}

function Avatar({ user }: { user: UserRecord }) {
  if (user.avatarDataUrl) {
    return (
      <img
        src={user.avatarDataUrl}
        alt={user.fullName}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
      {(user.firstName?.[0] || user.fullName?.[0] || (
        <UserIcon className="w-3.5 h-3.5" />
      )) as React.ReactNode}
    </div>
  );
}
