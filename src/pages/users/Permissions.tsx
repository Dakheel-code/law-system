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
} from "lucide-react";
import {
  permissionGroups,
  roles,
  defaultPermissionsFor,
  type PermissionGroup,
} from "../../config/userConfig";

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

export default function Permissions() {
  const [tab, setTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [granted, setGranted] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    roles.forEach((r) => {
      init[r.key] = new Set(defaultPermissionsFor(r.key));
    });
    return init;
  });

  const role = roles.find((r) => r.key === selectedRole);
  const grantedSet = selectedRole ? granted[selectedRole] : null;

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

  const toggleAll = (allOn: boolean) => {
    if (!selectedRole) return;
    const all = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key));
    setGranted((p) => ({ ...p, [selectedRole]: new Set(allOn ? all : []) }));
  };

  const togglePerm = (key: string) => {
    if (!selectedRole) return;
    setGranted((p) => {
      const next = new Set(p[selectedRole]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...p, [selectedRole]: next };
    });
  };

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

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Detail */}
          <div className="order-2 lg:order-1">
            {!selectedRole ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <ShieldCheck className="w-16 h-16 mb-3" strokeWidth={1.2} />
                <p className="text-sm text-slate-500">
                  اختر دوراً وظيفياً من القائمة لعرض وتعديل صلاحياته
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAll(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
                    >
                      <XCircle className="w-4 h-4" />
                      إلغاء الكل
                    </button>
                    <button
                      onClick={() => toggleAll(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تحديد الكل
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    صلاحيات دور:{" "}
                    <span className="text-brand-600">{role?.label}</span>
                  </h3>
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث في الصلاحيات..."
                    className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>

                <div className="space-y-4">
                  {filtered.map((g) => {
                    const GIcon = groupIcons[g.iconName];
                    const total = g.permissions.length;
                    const selected = g.permissions.filter((p) =>
                      grantedSet?.has(p.key)
                    ).length;
                    const allChecked = selected === total;
                    return (
                      <div key={g.key} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {selected}/{total}
                            </span>
                            <h4 className="flex items-center gap-2 text-base font-extrabold text-emerald-700">
                              {g.title}
                              <GIcon className="w-4 h-4" />
                            </h4>
                          </div>
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => {
                              if (!selectedRole) return;
                              setGranted((p) => {
                                const next = new Set(p[selectedRole]);
                                g.permissions.forEach((perm) => {
                                  if (allChecked) next.delete(perm.key);
                                  else next.add(perm.key);
                                });
                                return { ...p, [selectedRole]: next };
                              });
                            }}
                            className="w-4 h-4 accent-brand-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {g.permissions.map((perm) => {
                            const checked = grantedSet?.has(perm.key) ?? false;
                            return (
                              <label
                                key={perm.key}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-right justify-end"
                              >
                                {perm.default && (
                                  <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">
                                    افتراضي
                                  </span>
                                )}
                                <span className="text-sm text-slate-700">{perm.label}</span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePerm(perm.key)}
                                  className="w-4 h-4 accent-brand-500"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Roles list */}
          <aside className="card p-4 order-1 lg:order-2 lg:sticky lg:top-24 self-start">
            <h3 className="text-sm font-bold text-slate-800 mb-3 text-right">
              الأدوار الوظيفية
            </h3>
            <div className="space-y-2">
              {roles.map((r) => {
                const total = granted[r.key]?.size ?? 0;
                const isActive = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRole(r.key)}
                    className={`w-full text-right p-3 rounded-lg border transition ${
                      isActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-end gap-2 border-r-2 pr-2"
                         style={{ borderColor: isActive ? "#1e9a8a" : "#e2e8f0" }}>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isActive ? "text-brand-700" : "text-slate-700"}`}>
                          {r.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{total} صلاحية</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
