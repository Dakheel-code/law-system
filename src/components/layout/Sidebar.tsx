import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  ChevronDown,
  Search,
  LogOut,
  User,
  Circle,
} from "lucide-react";
import { menu, type MenuChild } from "../../config/menu";

function ChildLink({ child }: { child: MenuChild }) {
  const Icon = child.icon;
  return (
    <NavLink
      to={child.to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition ${
          isActive
            ? "bg-brand-50 text-brand-700 font-bold"
            : "text-slate-500 hover:bg-slate-50"
        }`
      }
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1 text-right">{child.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  // Live online/offline detection
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(menu.map((g) => [g.title ?? "", true]))
  );
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    menu.forEach((g) =>
      g.items.forEach((it) => {
        const childMatch = it.children?.some((c) =>
          location.pathname.startsWith(c.to)
        );
        const sectionMatch = it.sections?.some((s) =>
          s.children.some((c) => location.pathname.startsWith(c.to))
        );
        if (childMatch || sectionMatch) init[it.label] = true;
      })
    );
    return init;
  });

  const toggle = (key: string) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  const toggleItem = (key: string) =>
    setOpenItems((p) => ({ ...p, [key]: !p[key] }));

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-slate-100 overflow-hidden">
        {theme.logoDataUrl && (
          <img
            src={theme.logoDataUrl}
            alt="logo"
            className="h-9 w-9 object-contain shrink-0"
          />
        )}
        <div
          className="flex-1 min-w-0 text-lg font-extrabold text-brand-600 tracking-wide truncate text-right"
          title={theme.shortName}
        >
          {theme.shortName}
        </div>
      </div>

      {/* User */}
      <div className="p-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100">
          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
            {(user?.email?.[0] ?? "؟").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate" title={user?.email}>
              {(user?.user_metadata?.name as string | undefined) ?? user?.email?.split("@")[0] ?? "ضيف"}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              مدير المكتب
            </div>
          </div>
        </div>
      </div>

      {/* Quick search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="بحث سريع..."
            className="w-full pr-9 pl-14 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded">
              Ctrl
            </kbd>
            <kbd className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-1">
        {menu.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.title && (
              <button
                onClick={() => toggle(group.title!)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-slate-400"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1 h-3 bg-brand-500 rounded-full" />
                  {group.title}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openGroups[group.title!] ? "" : "-rotate-90"
                  }`}
                />
              </button>
            )}
            {openGroups[group.title ?? ""] &&
              group.items.map((item) => {
                const Icon = item.icon;
                if (item.children || item.sections) {
                  const isOpen = openItems[item.label];
                  const childActive =
                    item.children?.some((c) =>
                      location.pathname.startsWith(c.to)
                    ) ||
                    item.sections?.some((s) =>
                      s.children.some((c) => location.pathname.startsWith(c.to))
                    );
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleItem(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          childActive
                            ? "bg-brand-500 text-white shadow"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-right">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? "" : "-rotate-90"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="mt-1 mr-3 pr-3 border-r-2 border-slate-100 space-y-1">
                          {item.children?.map((c) => (
                            <ChildLink key={c.label} child={c} />
                          ))}
                          {item.sections?.map((section, si) => (
                            <div key={si} className="pt-1">
                              {section.title && (
                                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400">
                                  {section.title}
                                </div>
                              )}
                              {section.children.map((c) => (
                                <ChildLink key={c.label} child={c} />
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.label}
                    to={item.to ?? "#"}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-brand-500 text-white shadow"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-right">{item.label}</span>
                  </NavLink>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-500 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <Link
            to="/admin"
            title={user?.email ? `إعدادات الحساب (${user.email})` : "إعدادات الحساب"}
            className="w-8 h-8 rounded-lg hover:bg-brand-50 hover:text-brand-600 flex items-center justify-center text-slate-500 transition"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
        <div
          className={`text-xs flex items-center gap-1.5 ${
            online ? "text-slate-500" : "text-rose-500"
          }`}
          title={online ? "الاتصال بالإنترنت متاح" : "لا يوجد اتصال بالإنترنت"}
        >
          <Circle
            className={`w-2 h-2 ${
              online
                ? "fill-emerald-500 text-emerald-500"
                : "fill-rose-500 text-rose-500 animate-pulse"
            }`}
          />
          {online ? "النظام متصل" : "غير متصل"}
        </div>
      </div>
    </aside>
  );
}
