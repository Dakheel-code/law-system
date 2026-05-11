import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LogOut, User, Circle, X } from "lucide-react";
import { menu, type MenuChild } from "../../config/menu";
import { useCurrentStaff } from "../../lib/userStore";
import { userTypes } from "../../config/userConfig";

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

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme } = useTheme();
  const { staff } = useCurrentStaff(user?.id);

  const displayName =
    staff?.fullName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "ضيف";
  const initial = (
    staff?.firstName?.[0] ||
    staff?.fullName?.[0] ||
    user?.email?.[0] ||
    "؟"
  ).toUpperCase();
  const roleLabel =
    userTypes.find((t) => t.value === staff?.type)?.label || "مدير المكتب";

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

  return (
    <aside
      className={`w-64 shrink-0 bg-white border-l border-slate-200 flex flex-col h-screen
        fixed top-0 right-0 z-40 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto`}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-3 left-3 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
        title="إغلاق"
      >
        <X className="w-5 h-5" />
      </button>

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
          {staff?.avatarDataUrl ? (
            <img
              src={staff.avatarDataUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate" title={user?.email}>
              {displayName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-1">
        {menu.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.title && (
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-slate-400">
                <span className="w-1 h-3 bg-brand-500 rounded-full" />
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              if (item.children || item.sections) {
                const childActive =
                  item.children?.some((c) =>
                    location.pathname.startsWith(c.to)
                  ) ||
                  item.sections?.some((s) =>
                    s.children.some((c) => location.pathname.startsWith(c.to))
                  );
                return (
                  <div key={item.label}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        childActive
                          ? "bg-brand-500 text-white shadow"
                          : "text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-right">{item.label}</span>
                    </div>
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
            to="/profile"
            title={user?.email ? `الملف الشخصي (${user.email})` : "الملف الشخصي"}
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
