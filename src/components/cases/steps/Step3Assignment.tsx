import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  X,
  Check,
  Search,
  Scale,
  User as UserIcon,
  Edit3,
  Crown,
  HelpingHand,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import StepHeader from "../StepHeader";
import {
  assignmentRoleLabels,
  type CaseFormState,
  type CaseAssignment,
  type AssignmentRole,
} from "../caseFormTypes";
import { useUsers, type UserRecord } from "../../../lib/userStore";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

const roleMeta: Record<
  AssignmentRole,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; ring: string }
> = {
  primary: {
    icon: Crown,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    ring: "ring-amber-300",
  },
  assistant: {
    icon: HelpingHand,
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200",
    ring: "ring-sky-300",
  },
  supervisor: {
    icon: ShieldCheck,
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    ring: "ring-violet-300",
  },
  custom: {
    icon: Sparkles,
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    ring: "ring-slate-300",
  },
};

export default function Step3Assignment({ data, update }: Props) {
  const { users, loading } = useUsers();
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const candidates = users.filter((u) => u.status === "active");
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

  const selectedIds = new Set(data.assignments.map((a) => a.userId));

  const addAssignment = (userId: string) => {
    if (selectedIds.has(userId)) return;
    // Auto-pick role: first becomes primary if none exists, else assistant
    const hasPrimary = data.assignments.some((a) => a.role === "primary");
    const role: AssignmentRole =
      data.assignments.length === 0 || !hasPrimary ? "primary" : "assistant";
    const next: CaseAssignment[] = [...data.assignments, { userId, role }];
    update("assignments", next);
    // sync legacy fields
    update("assignedLawyers", next.map((a) => a.userId));
    update("assignedLawyer", next.find((a) => a.role === "primary")?.userId ?? next[0]?.userId ?? "");
  };

  const removeAssignment = (userId: string) => {
    const next = data.assignments.filter((a) => a.userId !== userId);
    update("assignments", next);
    update("assignedLawyers", next.map((a) => a.userId));
    update("assignedLawyer", next.find((a) => a.role === "primary")?.userId ?? next[0]?.userId ?? "");
  };

  const setRole = (userId: string, role: AssignmentRole) => {
    let next = data.assignments.map((a) =>
      a.userId === userId
        ? { ...a, role, customTitle: role === "custom" ? a.customTitle ?? "" : undefined }
        : a
    );
    // Only one primary at a time
    if (role === "primary") {
      next = next.map((a) =>
        a.userId === userId
          ? a
          : a.role === "primary"
          ? { ...a, role: "assistant" as AssignmentRole }
          : a
      );
    }
    update("assignments", next);
    update("assignedLawyer", next.find((a) => a.role === "primary")?.userId ?? next[0]?.userId ?? "");
  };

  const setCustomTitle = (userId: string, customTitle: string) => {
    const next = data.assignments.map((a) =>
      a.userId === userId ? { ...a, customTitle } : a
    );
    update("assignments", next);
  };

  const toggle = (userId: string) => {
    if (selectedIds.has(userId)) removeAssignment(userId);
    else addAssignment(userId);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="إسناد القضية"
        subtitle="عيِّن محامياً واحداً أو أكثر، وحدّد دور كل واحد منهم"
      />

      {/* Assigned list */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-md"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {open ? "إخفاء القائمة" : "إضافة مستخدمين"}
          </button>
          <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-700">
            المُسنَدون
            <span className="text-slate-400 font-normal text-sm">
              ({data.assignments.length})
            </span>
            <Scale className="w-4 h-4 text-brand-500" />
          </h3>
        </div>

        {data.assignments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
            <Scale
              className="w-10 h-10 text-slate-300 mx-auto mb-2"
              strokeWidth={1.4}
            />
            <p className="text-sm text-slate-500">
              لم يتم إسناد القضية لأحد بعد — اختر من القائمة أدناه
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {data.assignments.map((a) => {
              const user = users.find((u) => u.id === a.userId);
              if (!user) {
                return (
                  <li
                    key={a.userId}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <button
                      type="button"
                      onClick={() => removeAssignment(a.userId)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-slate-500">
                      مستخدم غير معروف ({a.userId})
                    </span>
                  </li>
                );
              }
              return (
                <AssignmentCard
                  key={a.userId}
                  user={user}
                  assignment={a}
                  onRemove={() => removeAssignment(a.userId)}
                  onSetRole={(r) => setRole(a.userId, r)}
                  onSetCustomTitle={(t) => setCustomTitle(a.userId, t)}
                />
              );
            })}
          </ul>
        )}
      </div>

      {/* Picker */}
      {open && (
        <div className="border-t border-dashed border-slate-200 pt-5">
          <h4 className="text-sm font-bold text-slate-700 text-right mb-3">
            اختر من قائمة المستخدمين
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
                  لا يوجد مستخدمون مطابقون
                </div>
              ) : (
                filtered.map((u) => {
                  const sel = selectedIds.has(u.id);
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
                {selectedIds.size} مختار من <bdi dir="ltr">{candidates.length}</bdi>
              </span>
              <button
                type="button"
                onClick={() => {
                  update("assignments", []);
                  update("assignedLawyers", []);
                  update("assignedLawyer", "");
                }}
                disabled={data.assignments.length === 0}
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
          اختر لكل مستخدم دوره في القضية. الأدوار المتاحة:{" "}
          <strong>المحامي الأساسي</strong> /{" "}
          <strong>المحامي المساعد</strong> /{" "}
          <strong>المشرف القانوني</strong>. أو اختر «مخصص» لإضافة مسمى خاص بالقضية.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Assignment card — shows user + role selector + custom title
// ============================================================

function AssignmentCard({
  user,
  assignment,
  onRemove,
  onSetRole,
  onSetCustomTitle,
}: {
  user: UserRecord;
  assignment: CaseAssignment;
  onRemove: () => void;
  onSetRole: (r: AssignmentRole) => void;
  onSetCustomTitle: (t: string) => void;
}) {
  const meta = roleMeta[assignment.role];
  const Icon = meta.icon;
  const roleLabel =
    assignment.role === "custom"
      ? assignment.customTitle?.trim() || "مخصص"
      : assignmentRoleLabels[assignment.role];

  return (
    <li className={`rounded-xl border p-3 ${meta.bg}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md"
            title="إزالة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-white border ${meta.ring} ${meta.color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {roleLabel}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2 justify-end">
          <div className="text-right min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">
              {user.fullName || user.code}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {user.email || user.code}
            </div>
          </div>
          {user.avatarDataUrl ? (
            <img
              src={user.avatarDataUrl}
              alt={user.fullName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shrink-0">
              {(user.firstName?.[0] || user.fullName?.[0] || "؟").toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Role selector */}
      <div className="mt-3 pt-3 border-t border-white/50 flex flex-wrap items-center justify-end gap-1.5">
        <RolePill
          icon={Crown}
          label="المحامي الأساسي"
          active={assignment.role === "primary"}
          onClick={() => onSetRole("primary")}
          activeColor="bg-amber-500"
        />
        <RolePill
          icon={HelpingHand}
          label="المحامي المساعد"
          active={assignment.role === "assistant"}
          onClick={() => onSetRole("assistant")}
          activeColor="bg-sky-500"
        />
        <RolePill
          icon={ShieldCheck}
          label="المشرف القانوني"
          active={assignment.role === "supervisor"}
          onClick={() => onSetRole("supervisor")}
          activeColor="bg-violet-500"
        />
        <RolePill
          icon={Sparkles}
          label="مخصص"
          active={assignment.role === "custom"}
          onClick={() => onSetRole("custom")}
          activeColor="bg-slate-700"
        />
      </div>

      {/* Custom title input */}
      {assignment.role === "custom" && (
        <div className="mt-3">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
            المسمى المخصص داخل القضية *
          </label>
          <input
            value={assignment.customTitle ?? ""}
            onChange={(e) => onSetCustomTitle(e.target.value)}
            placeholder="مثال: مستشار قانوني، محامي ثانوي، خبير شرعي..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      )}
    </li>
  );
}

function RolePill({
  icon: Icon,
  label,
  active,
  onClick,
  activeColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
        active
          ? `${activeColor} text-white border-transparent shadow-sm`
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
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
