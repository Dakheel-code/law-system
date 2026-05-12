import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Settings,
  Package,
  Users as UsersIcon,
  Home,
  Briefcase,
  MessageSquare,
  FileText,
  DollarSign,
  Users2,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  permissionGroups,
  roles as defaultRoles,
  defaultPermissionsFor,
  type Role,
  type PermissionGroup,
} from "../../config/userConfig";
import { useUsers } from "../../lib/userStore";
import {
  usePermissionSettings,
  type CustomRole,
  type PermissionBundle,
} from "../../lib/permissionsStore";

const tabs = [
  { key: "roles", label: "صلاحيات الأدوار", icon: ShieldCheck },
  { key: "users", label: "صلاحيات المستخدمين", icon: UsersIcon },
  { key: "bundles", label: "باقات الصلاحيات", icon: Package },
  { key: "manage", label: "إدارة الأدوار", icon: Settings },
] as const;

const groupIcons: Record<
  PermissionGroup["iconName"],
  React.ComponentType<{ className?: string }>
> = {
  general: Home,
  cases: Briefcase,
  consultations: MessageSquare,
  contracts: FileText,
  clients: UsersIcon,
  finance: DollarSign,
  hr: Users2,
};

const allPermissionKeys = () =>
  permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));

const defaultBundles: PermissionBundle[] = [
  {
    key: "read-only",
    label: "للقراءة فقط",
    description: "عرض البيانات دون أي صلاحيات تعديل",
    permissions: ["view-stats", "view-my-tasks", "view-clients", "view-my-cases", "view-my-requests"],
  },
  {
    key: "lawyer-base",
    label: "محامي أساسي",
    description: "صلاحيات أساسية لمحامٍ في الإدارة اليومية",
    permissions: defaultPermissionsFor("lawyer"),
  },
  {
    key: "manager",
    label: "إدارة كاملة",
    description: "كل الصلاحيات بما فيها الاعتمادات والحذف",
    permissions: allPermissionKeys(),
  },
];

export default function Permissions() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("roles");
  const { settings, loading, error, saving, savedTick, save } =
    usePermissionSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">جارٍ تحميل الصلاحيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
        <div className="text-right flex-1">
          <h3 className="text-sm font-bold text-rose-700">حدث خطأ</h3>
          <p className="text-xs text-slate-600 mt-1 font-mono" dir="ltr">
            {error}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            تأكد من تشغيل migration{" "}
            <code className="font-mono bg-slate-100 px-1 rounded">
              018_permissions.sql
            </code>{" "}
            في Supabase SQL Editor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 flex items-center justify-between gap-3">
        <SaveIndicator saving={saving} savedTick={savedTick} />
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          إدارة الصلاحيات والتفويض
          <ShieldCheck className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="card">
        <div className="border-b border-slate-200 flex justify-start">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition relative ${
                  active
                    ? "text-brand-700 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{t.label}</span>
                <Icon className="w-4 h-4" />
                {active && (
                  <span className="absolute -bottom-px right-0 left-0 h-0.5 bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {tab === "roles" && (
            <RolesTab
              roleGrants={settings.roleGrants}
              customRoles={settings.customRoles}
              onSave={(roleGrants) => save({ roleGrants })}
            />
          )}
          {tab === "users" && (
            <UsersTab
              userGrants={settings.userGrants}
              onSave={(userGrants) => save({ userGrants })}
            />
          )}
          {tab === "bundles" && (
            <BundlesTab
              bundles={settings.bundles}
              onSave={(bundles) => save({ bundles })}
            />
          )}
          {tab === "manage" && (
            <ManageRolesTab
              customRoles={settings.customRoles}
              roleGrants={settings.roleGrants}
              onSave={(customRoles, roleGrants) =>
                save({ customRoles, ...(roleGrants ? { roleGrants } : {}) })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({
  saving,
  savedTick,
}: {
  saving: boolean;
  savedTick: number;
}) {
  const [recentlySaved, setRecentlySaved] = useState(false);
  useEffect(() => {
    if (savedTick === 0) return;
    setRecentlySaved(true);
    const t = setTimeout(() => setRecentlySaved(false), 1500);
    return () => clearTimeout(t);
  }, [savedTick]);

  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        جارٍ الحفظ...
      </span>
    );
  }
  if (recentlySaved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        تم الحفظ
      </span>
    );
  }
  return null;
}

// ============================================================
// Roles Tab — assign permissions per role
// ============================================================

function RolesTab({
  roleGrants,
  customRoles,
  onSave,
}: {
  roleGrants: Record<string, string[]>;
  customRoles: CustomRole[];
  onSave: (next: Record<string, string[]>) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Merge built-in + custom roles into one list
  const allRoles: Role[] = useMemo(() => {
    const customAsRoles: Role[] = customRoles.map((r) => ({
      key: r.key,
      label: r.label,
      count: 0,
    }));
    return [...defaultRoles, ...customAsRoles];
  }, [customRoles]);

  // Resolved permissions for the selected role — fall back to defaults for
  // built-in roles that haven't been saved yet.
  const grantedSet = useMemo(() => {
    if (!selectedRole) return new Set<string>();
    const stored = roleGrants[selectedRole];
    if (stored) return new Set(stored);
    return new Set(defaultPermissionsFor(selectedRole));
  }, [roleGrants, selectedRole]);

  const persist = (next: Set<string>) => {
    if (!selectedRole) return;
    onSave({ ...roleGrants, [selectedRole]: Array.from(next) });
  };

  const togglePerm = (key: string) => {
    const next = new Set(grantedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    persist(next);
  };

  const toggleAll = (on: boolean) => {
    persist(new Set(on ? allPermissionKeys() : []));
  };

  return (
    <PermissionLayout
      sidebar={
        <RoleList
          items={allRoles}
          selected={selectedRole}
          onSelect={setSelectedRole}
          countFn={(key) =>
            roleGrants[key]?.length ?? defaultPermissionsFor(key).length
          }
        />
      }
    >
      {!selectedRole ? (
        <EmptyDetail message="اختر دوراً وظيفياً من القائمة لعرض وتعديل صلاحياته" />
      ) : (
        <PermissionEditor
          title={
            <>
              صلاحيات دور:{" "}
              <span className="text-brand-600">
                {allRoles.find((r) => r.key === selectedRole)?.label}
              </span>
            </>
          }
          search={search}
          onSearchChange={setSearch}
          grantedSet={grantedSet}
          onToggle={togglePerm}
          onToggleAll={toggleAll}
        />
      )}
    </PermissionLayout>
  );
}

// ============================================================
// Users Tab — override permissions per user
// ============================================================

function UsersTab({
  userGrants,
  onSave,
}: {
  userGrants: Record<string, string[]>;
  onSave: (next: Record<string, string[]>) => void;
}) {
  const { users, loading } = useUsers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const selectedUser = users.find((u) => u.id === selectedId);

  const grantedSet = useMemo(() => {
    if (!selectedUser) return new Set<string>();
    const stored = userGrants[selectedUser.id];
    if (stored) return new Set(stored);
    return new Set(defaultPermissionsFor(selectedUser.type || "lawyer"));
  }, [userGrants, selectedUser]);

  const persist = (next: Set<string>) => {
    if (!selectedUser) return;
    onSave({ ...userGrants, [selectedUser.id]: Array.from(next) });
  };

  const togglePerm = (key: string) => {
    const next = new Set(grantedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    persist(next);
  };

  const toggleAll = (on: boolean) => {
    persist(new Set(on ? allPermissionKeys() : []));
  };

  const resetToDefault = () => {
    if (!selectedUser) return;
    const next = { ...userGrants };
    delete next[selectedUser.id];
    onSave(next);
  };

  return (
    <PermissionLayout
      sidebar={
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-3 text-right">
            المستخدمون
          </h3>
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8">
              جارٍ التحميل...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8">
              لا يوجد مستخدمون
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const isActive = selectedId === u.id;
                const hasOverride = userGrants[u.id] !== undefined;
                const count = hasOverride
                  ? userGrants[u.id].length
                  : defaultPermissionsFor(u.type || "lawyer").length;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`w-full text-right p-3 rounded-lg border transition ${
                      isActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className="text-right border-r-2 pr-2"
                      style={{
                        borderColor: isActive ? "#1e9a8a" : "#e2e8f0",
                      }}
                    >
                      <div
                        className={`text-sm font-bold truncate ${
                          isActive ? "text-brand-700" : "text-slate-700"
                        }`}
                      >
                        {u.fullName || "بدون اسم"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {count} صلاحية{" "}
                        {hasOverride && (
                          <span className="text-amber-600">(مخصصة)</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      }
    >
      {!selectedUser ? (
        <EmptyDetail message="اختر مستخدماً من القائمة لتخصيص صلاحياته" />
      ) : (
        <PermissionEditor
          title={
            <>
              صلاحيات المستخدم:{" "}
              <span className="text-brand-600">{selectedUser.fullName}</span>
              {userGrants[selectedUser.id] !== undefined && (
                <button
                  onClick={resetToDefault}
                  className="block text-xs text-amber-600 hover:underline mt-1"
                >
                  ↻ إعادة لافتراضي الدور
                </button>
              )}
            </>
          }
          search={search}
          onSearchChange={setSearch}
          grantedSet={grantedSet}
          onToggle={togglePerm}
          onToggleAll={toggleAll}
        />
      )}
    </PermissionLayout>
  );
}

// ============================================================
// Bundles Tab — manage permission bundles
// ============================================================

function BundlesTab({
  bundles,
  onSave,
}: {
  bundles: PermissionBundle[];
  onSave: (next: PermissionBundle[]) => void;
}) {
  // Merge defaults with stored — stored overrides defaults by key.
  const effective: PermissionBundle[] = useMemo(() => {
    const map = new Map(bundles.map((b) => [b.key, b]));
    const merged = defaultBundles.map((b) => map.get(b.key) ?? b);
    // Append stored bundles that aren't in defaults (user-defined)
    bundles.forEach((b) => {
      if (!defaultBundles.some((d) => d.key === b.key)) merged.push(b);
    });
    return merged;
  }, [bundles]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const selectedBundle = effective.find((b) => b.key === selectedKey);
  const grantedSet = new Set(selectedBundle?.permissions ?? []);

  const persistBundles = (next: PermissionBundle[]) => onSave(next);

  const replaceBundle = (key: string, patch: Partial<PermissionBundle>) => {
    const existing = bundles.find((b) => b.key === key);
    const base = existing ?? effective.find((b) => b.key === key);
    if (!base) return;
    const merged = { ...base, ...patch };
    const without = bundles.filter((b) => b.key !== key);
    persistBundles([...without, merged]);
  };

  const togglePerm = (key: string) => {
    if (!selectedBundle) return;
    const has = selectedBundle.permissions.includes(key);
    const nextPerms = has
      ? selectedBundle.permissions.filter((p) => p !== key)
      : [...selectedBundle.permissions, key];
    replaceBundle(selectedBundle.key, { permissions: nextPerms });
  };

  const toggleAll = (on: boolean) => {
    if (!selectedBundle) return;
    replaceBundle(selectedBundle.key, {
      permissions: on ? allPermissionKeys() : [],
    });
  };

  const addBundle = () => {
    if (!newName.trim()) return;
    const key = `bundle-${Date.now()}`;
    persistBundles([
      ...bundles,
      {
        key,
        label: newName.trim(),
        description: "باقة مخصصة",
        permissions: [],
      },
    ]);
    setSelectedKey(key);
    setNewName("");
    setShowAdd(false);
  };

  const deleteBundle = (key: string) => {
    if (!confirm("هل تريد حذف هذه الباقة؟")) return;
    persistBundles(bundles.filter((b) => b.key !== key));
    if (selectedKey === key) setSelectedKey(null);
  };

  return (
    <PermissionLayout
      sidebar={
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              جديدة
            </button>
            <h3 className="text-sm font-bold text-slate-800 text-right">
              باقات الصلاحيات
            </h3>
          </div>
          {showAdd && (
            <div className="mb-3 p-2 rounded-lg bg-slate-50 border border-slate-200 flex gap-1">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewName("");
                }}
                className="p-1.5 rounded-md hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={addBundle}
                className="p-1.5 rounded-md bg-brand-500 text-white hover:bg-brand-600"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBundle()}
                placeholder="اسم الباقة"
                className="flex-1 text-right px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                autoFocus
              />
            </div>
          )}
          <div className="space-y-2">
            {effective.map((b) => {
              const isActive = selectedKey === b.key;
              const isCustom = b.key.startsWith("bundle-");
              return (
                <div key={b.key} className="relative group">
                  <button
                    onClick={() => setSelectedKey(b.key)}
                    className={`w-full text-right p-3 rounded-lg border transition ${
                      isActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className="text-right border-r-2 pr-2"
                      style={{
                        borderColor: isActive ? "#1e9a8a" : "#e2e8f0",
                      }}
                    >
                      <div
                        className={`text-sm font-bold ${
                          isActive ? "text-brand-700" : "text-slate-700"
                        }`}
                      >
                        {b.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {b.permissions.length} صلاحية
                      </div>
                    </div>
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => deleteBundle(b.key)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      }
    >
      {!selectedBundle ? (
        <EmptyDetail message="اختر باقة من القائمة لعرض وتعديل صلاحياتها" />
      ) : (
        <PermissionEditor
          title={
            <>
              باقة:{" "}
              <span className="text-brand-600">{selectedBundle.label}</span>
              <span className="block text-xs font-normal text-slate-500 mt-1">
                {selectedBundle.description}
              </span>
            </>
          }
          search={search}
          onSearchChange={setSearch}
          grantedSet={grantedSet}
          onToggle={togglePerm}
          onToggleAll={toggleAll}
        />
      )}
    </PermissionLayout>
  );
}

// ============================================================
// Manage Roles Tab — CRUD for custom roles
// ============================================================

function ManageRolesTab({
  customRoles,
  roleGrants,
  onSave,
}: {
  customRoles: CustomRole[];
  roleGrants: Record<string, string[]>;
  onSave: (
    customRoles: CustomRole[],
    roleGrants?: Record<string, string[]>
  ) => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Merged list: built-in roles (not editable/removable) + custom roles
  const allRoles = useMemo(() => {
    const builtIn = defaultRoles.map((r) => ({
      ...r,
      isBuiltin: true,
    }));
    const custom = customRoles.map((r) => ({
      key: r.key,
      label: r.label,
      count: 0,
      isBuiltin: false,
    }));
    return [...builtIn, ...custom];
  }, [customRoles]);

  const startEdit = (key: string, label: string) => {
    setEditingKey(key);
    setEditingLabel(label);
  };

  const saveEdit = () => {
    if (!editingKey || !editingLabel.trim()) return;
    const next = customRoles.map((r) =>
      r.key === editingKey ? { ...r, label: editingLabel.trim() } : r
    );
    onSave(next);
    setEditingKey(null);
    setEditingLabel("");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingLabel("");
  };

  const removeRole = (key: string) => {
    if (!confirm("هل تريد حذف هذا الدور؟ سيُزال أيضاً من صلاحيات الأدوار."))
      return;
    const nextRoles = customRoles.filter((r) => r.key !== key);
    const nextGrants = { ...roleGrants };
    delete nextGrants[key];
    onSave(nextRoles, nextGrants);
  };

  const addRole = () => {
    if (!newLabel.trim()) return;
    const key = `role-${Date.now()}`;
    onSave([...customRoles, { key, label: newLabel.trim() }]);
    setNewLabel("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRole()}
          placeholder="اسم الدور الجديد..."
          className="flex-1 min-w-[200px] px-4 py-2.5 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          onClick={addRole}
          disabled={!newLabel.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          إضافة دور
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allRoles.map((r) => {
          const grantCount =
            roleGrants[r.key]?.length ?? defaultPermissionsFor(r.key).length;
          return (
            <div
              key={r.key}
              className="rounded-xl border border-slate-200 p-4 hover:shadow-card transition"
            >
              {editingKey === r.key ? (
                <div className="space-y-2">
                  <input
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    autoFocus
                  />
                  <div className="flex items-center justify-start gap-2">
                    <button
                      onClick={saveEdit}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-bold hover:bg-emerald-600"
                    >
                      <Save className="w-3.5 h-3.5" />
                      حفظ
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-xs font-bold hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {!r.isBuiltin && (
                        <>
                          <button
                            onClick={() => removeRole(r.key)}
                            className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(r.key, r.label)}
                            className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {r.isBuiltin && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          مدمج
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-1 min-w-0">
                      <div className="text-base font-bold text-slate-800 truncate">
                        {r.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-right space-y-0.5">
                    <div>
                      الصلاحيات:{" "}
                      <span className="font-bold text-slate-700">{grantCount}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================

function PermissionLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      <aside className="card p-4 order-1 lg:sticky lg:top-24 self-start">
        {sidebar}
      </aside>
      <div className="order-2">{children}</div>
    </div>
  );
}

function EmptyDetail({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
      <ShieldCheck className="w-16 h-16 mb-3" strokeWidth={1.2} />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function RoleList({
  items,
  selected,
  onSelect,
  countFn,
}: {
  items: Role[];
  selected: string | null;
  onSelect: (key: string) => void;
  countFn: (key: string) => number;
}) {
  return (
    <>
      <h3 className="text-sm font-bold text-slate-800 mb-3 text-right">
        الأدوار الوظيفية
      </h3>
      <div className="space-y-2">
        {items.map((r) => {
          const isActive = selected === r.key;
          const count = countFn(r.key);
          return (
            <button
              key={r.key}
              onClick={() => onSelect(r.key)}
              className={`w-full text-right p-3 rounded-lg border transition ${
                isActive
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div
                className="text-right border-r-2 pr-2"
                style={{ borderColor: isActive ? "#1e9a8a" : "#e2e8f0" }}
              >
                <div
                  className={`text-sm font-bold ${
                    isActive ? "text-brand-700" : "text-slate-700"
                  }`}
                >
                  {r.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {count} صلاحية
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function PermissionEditor({
  title,
  search,
  onSearchChange,
  grantedSet,
  onToggle,
  onToggleAll,
}: {
  title: React.ReactNode;
  search: string;
  onSearchChange: (v: string) => void;
  grantedSet: Set<string>;
  onToggle: (key: string) => void;
  onToggleAll: (on: boolean) => void;
}) {
  const filtered = useMemo(() => {
    if (!search) return permissionGroups;
    const q = search.toLowerCase();
    return permissionGroups
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter((p) =>
          p.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleAll(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <XCircle className="w-4 h-4" />
            إلغاء الكل
          </button>
          <button
            onClick={() => onToggleAll(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"
          >
            <CheckCircle2 className="w-4 h-4" />
            تحديد الكل
          </button>
        </div>
        <h3 className="text-base font-bold text-slate-800 text-right">
          {title}
        </h3>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث في الصلاحيات..."
          className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((g) => {
          const GIcon = groupIcons[g.iconName];
          const total = g.permissions.length;
          const selected = g.permissions.filter((p) => grantedSet.has(p.key))
            .length;
          const allChecked = selected === total && total > 0;
          return (
            <div key={g.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => {
                    g.permissions.forEach((perm) => {
                      const has = grantedSet.has(perm.key);
                      if (allChecked && has) onToggle(perm.key);
                      else if (!allChecked && !has) onToggle(perm.key);
                    });
                  }}
                  className="w-4 h-4 accent-brand-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {selected}/{total}
                  </span>
                  <h4 className="flex items-center justify-start gap-2 text-base font-extrabold text-emerald-700">
                    {g.title}
                    <GIcon className="w-4 h-4" />
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {g.permissions.map((perm) => {
                  const checked = grantedSet.has(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-right justify-start"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(perm.key)}
                        className="w-4 h-4 accent-brand-500"
                      />
                      <span className="text-sm text-slate-700 flex-1">
                        {perm.label}
                      </span>
                      {perm.default && (
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded shrink-0">
                          افتراضي
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
