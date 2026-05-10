import { useState, useMemo } from "react";
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
} from "lucide-react";
import {
  permissionGroups,
  roles as defaultRoles,
  defaultPermissionsFor,
  type Role,
  type PermissionGroup,
} from "../../config/userConfig";
import { useUsers } from "../../lib/userStore";

const tabs = [
  { key: "roles", label: "صلاحيات الأدوار", icon: ShieldCheck },
  { key: "users", label: "صلاحيات المستخدمين", icon: UsersIcon },
  { key: "bundles", label: "باقات الصلاحيات", icon: Package },
  { key: "manage", label: "إدارة الأدوار", icon: Settings },
];

const groupIcons: Record<PermissionGroup["iconName"], React.ComponentType<{ className?: string }>> = {
  general: Home,
  cases: Briefcase,
  consultations: MessageSquare,
  contracts: FileText,
  clients: UsersIcon,
  finance: DollarSign,
  hr: Users2,
};

type Bundle = {
  key: string;
  label: string;
  description: string;
  permissions: string[];
};

const initialBundles: Bundle[] = [
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
    permissions: permissionGroups.flatMap((g) => g.permissions.map((p) => p.key)),
  },
];

export default function Permissions() {
  const [tab, setTab] = useState("roles");

  return (
    <div className="space-y-5">
      <div className="card p-5 flex items-center justify-start">
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
          {tab === "roles" && <RolesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "bundles" && <BundlesTab />}
          {tab === "manage" && <ManageRolesTab />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Roles Tab — assign permissions per role
// ============================================================

function RolesTab() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [granted, setGranted] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    defaultRoles.forEach((r) => {
      init[r.key] = new Set(defaultPermissionsFor(r.key));
    });
    return init;
  });

  return (
    <PermissionLayout
      sidebar={
        <RoleList
          items={defaultRoles}
          selected={selectedRole}
          onSelect={setSelectedRole}
          countFn={(key) => granted[key]?.size ?? 0}
        />
      }
    >
      {!selectedRole ? (
        <EmptyDetail message="اختر دوراً وظيفياً من القائمة لعرض وتعديل صلاحياته" />
      ) : (
        <PermissionEditor
          title={
            <>
              صلاحيات دور: <span className="text-brand-600">{defaultRoles.find((r) => r.key === selectedRole)?.label}</span>
            </>
          }
          search={search}
          onSearchChange={setSearch}
          grantedSet={granted[selectedRole]}
          onToggle={(key) =>
            setGranted((p) => {
              const next = new Set(p[selectedRole]);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return { ...p, [selectedRole]: next };
            })
          }
          onToggleAll={(on) => {
            const all = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));
            setGranted((p) => ({ ...p, [selectedRole]: new Set(on ? all : []) }));
          }}
        />
      )}
    </PermissionLayout>
  );
}

// ============================================================
// Users Tab — override permissions per user
// ============================================================

function UsersTab() {
  const { users, loading } = useUsers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [granted, setGranted] = useState<Record<string, Set<string>>>({});

  const ensureUser = (id: string, roleKey: string) => {
    if (granted[id]) return;
    setGranted((p) => ({ ...p, [id]: new Set(defaultPermissionsFor(roleKey)) }));
  };

  const selectedUser = users.find((u) => u.id === selectedId);

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
                const count = granted[u.id]?.size;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      ensureUser(u.id, u.type || "lawyer");
                      setSelectedId(u.id);
                    }}
                    className={`w-full text-right p-3 rounded-lg border transition ${
                      isActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-right border-r-2 pr-2"
                         style={{ borderColor: isActive ? "#1e9a8a" : "#e2e8f0" }}>
                      <div className={`text-sm font-bold truncate ${isActive ? "text-brand-700" : "text-slate-700"}`}>
                        {u.fullName || "بدون اسم"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {count !== undefined ? `${count} صلاحية` : "افتراضية"}
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
            </>
          }
          search={search}
          onSearchChange={setSearch}
          grantedSet={granted[selectedUser.id]}
          onToggle={(key) =>
            setGranted((p) => {
              const next = new Set(p[selectedUser.id]);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return { ...p, [selectedUser.id]: next };
            })
          }
          onToggleAll={(on) => {
            const all = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));
            setGranted((p) => ({ ...p, [selectedUser.id]: new Set(on ? all : []) }));
          }}
        />
      )}
    </PermissionLayout>
  );
}

// ============================================================
// Bundles Tab — manage permission bundles
// ============================================================

function BundlesTab() {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const selectedBundle = bundles.find((b) => b.key === selectedKey);
  const grantedSet = new Set(selectedBundle?.permissions ?? []);

  const togglePerm = (key: string) => {
    if (!selectedKey) return;
    setBundles((all) =>
      all.map((b) =>
        b.key === selectedKey
          ? {
              ...b,
              permissions: b.permissions.includes(key)
                ? b.permissions.filter((p) => p !== key)
                : [...b.permissions, key],
            }
          : b
      )
    );
  };

  const toggleAll = (on: boolean) => {
    if (!selectedKey) return;
    const all = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));
    setBundles((items) =>
      items.map((b) => (b.key === selectedKey ? { ...b, permissions: on ? all : [] } : b))
    );
  };

  const addBundle = () => {
    if (!newName.trim()) return;
    const key = `bundle-${Date.now()}`;
    setBundles((p) => [
      ...p,
      { key, label: newName.trim(), description: "باقة مخصصة", permissions: [] },
    ]);
    setSelectedKey(key);
    setNewName("");
    setShowAdd(false);
  };

  const deleteBundle = (key: string) => {
    if (!confirm("هل تريد حذف هذه الباقة؟")) return;
    setBundles((p) => p.filter((b) => b.key !== key));
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
                placeholder="اسم الباقة"
                className="flex-1 text-right px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                autoFocus
              />
            </div>
          )}
          <div className="space-y-2">
            {bundles.map((b) => {
              const isActive = selectedKey === b.key;
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
                    <div className="text-right border-r-2 pr-2"
                         style={{ borderColor: isActive ? "#1e9a8a" : "#e2e8f0" }}>
                      <div className={`text-sm font-bold ${isActive ? "text-brand-700" : "text-slate-700"}`}>
                        {b.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {b.permissions.length} صلاحية
                      </div>
                    </div>
                  </button>
                  {b.key.startsWith("bundle-") && (
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
// Manage Roles Tab — CRUD for roles
// ============================================================

function ManageRolesTab() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const startEdit = (r: Role) => {
    setEditingKey(r.key);
    setEditingLabel(r.label);
  };

  const saveEdit = () => {
    if (!editingKey || !editingLabel.trim()) return;
    setRoles((p) =>
      p.map((r) => (r.key === editingKey ? { ...r, label: editingLabel.trim() } : r))
    );
    setEditingKey(null);
    setEditingLabel("");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingLabel("");
  };

  const removeRole = (key: string) => {
    if (!confirm("هل تريد حذف هذا الدور؟")) return;
    setRoles((p) => p.filter((r) => r.key !== key));
  };

  const addRole = () => {
    if (!newLabel.trim()) return;
    const key = `role-${Date.now()}`;
    setRoles((p) => [...p, { key, label: newLabel.trim(), count: 0 }]);
    setNewLabel("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addRole();
          }}
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
        {roles.map((r) => (
          <div
            key={r.key}
            className="rounded-xl border border-slate-200 p-4 hover:shadow-card transition"
          >
            {editingKey === r.key ? (
              <div className="space-y-2">
                <input
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
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
                    <button
                      onClick={() => removeRole(r.key)}
                      className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(r)}
                      className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-800 truncate">
                      {r.label}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  المستخدمون: <span className="font-bold text-slate-700">{r.count}</span>
                </div>
              </>
            )}
          </div>
        ))}
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
      <aside className="card p-4 order-1 lg:sticky lg:top-24 self-start">{sidebar}</aside>
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
                <div className="text-xs text-slate-400 mt-0.5">{count} صلاحية</div>
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
  grantedSet: Set<string> | undefined;
  onToggle: (key: string) => void;
  onToggleAll: (on: boolean) => void;
}) {
  const filtered = useMemo(() => {
    if (!search) return permissionGroups;
    const q = search.toLowerCase();
    return permissionGroups
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter((p) => p.label.toLowerCase().includes(q)),
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
        <h3 className="text-base font-bold text-slate-800 text-right">{title}</h3>
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
          const selected = g.permissions.filter((p) => grantedSet?.has(p.key)).length;
          const allChecked = selected === total && total > 0;
          return (
            <div key={g.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => {
                    g.permissions.forEach((perm) => {
                      const has = grantedSet?.has(perm.key) ?? false;
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
                  const checked = grantedSet?.has(perm.key) ?? false;
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
                      <span className="text-sm text-slate-700 flex-1">{perm.label}</span>
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
