import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  Bell,
  Calendar,
  User,
  Settings,
  LogOut,
  Inbox,
  CheckCheck,
  Palette,
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps = {}) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { theme, update } = useTheme();
  const { user, signOut } = useAuth();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Future: route to search results
    alert(`نتائج البحث عن: ${search}`);
  };

  const cycleMode = () => {
    const next =
      theme.mode === "light" ? "dark" : theme.mode === "dark" ? "system" : "light";
    update("mode", next);
  };

  const ModeIcon =
    theme.mode === "dark" ? Moon : theme.mode === "system" ? Monitor : Sun;

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 lg:h-20 px-3 lg:px-6 flex items-center gap-2 lg:gap-4 sticky top-0 z-10 bg-slate-50/80 backdrop-blur">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        title="القائمة"
        className="lg:hidden w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <form onSubmit={onSearch} className="flex-1 max-w-3xl min-w-0">
        <div className="relative">
          <Search className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث..."
            className="w-full pr-9 lg:pr-12 pl-3 lg:pl-4 py-2.5 lg:py-3.5 bg-white border border-slate-200 rounded-xl shadow-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </form>

      <div className="flex items-center gap-1 lg:gap-2 mr-auto">
        {/* Calendar — hidden on smallest screens */}
        <span className="hidden sm:inline-flex">
          <IconLink to="/calendar" icon={Calendar} title="التقويم" />
        </span>

        {/* Notifications */}
        <Dropdown
          align="left"
          trigger={(open) => <IconBtn icon={Bell} dot title="الإشعارات" active={open} />}
        >
          <NotificationsPanel />
        </Dropdown>

        {/* Messages — hidden on smallest screens */}
        <span className="hidden sm:inline-flex">
          <Dropdown
            align="left"
            trigger={(open) => <IconBtn icon={MessageSquare} title="الرسائل" active={open} />}
          >
            <MessagesPanel />
          </Dropdown>
        </span>

        {/* Theme mode toggle */}
        <button
          onClick={cycleMode}
          title={`الوضع: ${theme.mode === "dark" ? "داكن" : theme.mode === "system" ? "تلقائي" : "فاتح"}`}
          className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition shrink-0"
        >
          <ModeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>

        {/* User menu */}
        <Dropdown
          align="left"
          width="w-64"
          trigger={() => (
            <button className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-500 hover:bg-slate-50 transition shrink-0">
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          )}
        >
          <UserMenu email={user?.email} onLogout={handleLogout} />
        </Dropdown>
      </div>
    </header>
  );
}

function IconLink({
  to,
  icon: Icon,
  title,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Link
      to={to}
      title={title}
      className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition shrink-0"
    >
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
    </Link>
  );
}

function IconBtn({
  icon: Icon,
  dot,
  title,
  active,
}: {
  icon: LucideIcon;
  dot?: boolean;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      className={`relative w-9 h-9 lg:w-11 lg:h-11 rounded-full border shadow-card flex items-center justify-center transition shrink-0 ${
        active
          ? "bg-brand-50 border-brand-200 text-brand-600"
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600"
      }`}
    >
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
      {dot && (
        <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500" />
      )}
    </button>
  );
}

function NotificationsPanel() {
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">
          تعليم الكل كمقروء
        </button>
        <h3 className="text-sm font-bold text-slate-800">الإشعارات</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-slate-300">
        <Bell className="w-12 h-12 mb-3" strokeWidth={1.2} />
        <p className="text-sm text-slate-500">لا توجد إشعارات</p>
      </div>
      <div className="border-t border-slate-100 p-3">
        <button className="w-full text-center text-sm text-brand-600 hover:text-brand-700 font-bold">
          عرض كل الإشعارات
        </button>
      </div>
    </div>
  );
}

function MessagesPanel() {
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
          <CheckCheck className="w-3.5 h-3.5" />
          تعليم الكل كمقروء
        </button>
        <h3 className="text-sm font-bold text-slate-800">الرسائل</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-slate-300">
        <Inbox className="w-12 h-12 mb-3" strokeWidth={1.2} />
        <p className="text-sm text-slate-500">لا توجد رسائل</p>
      </div>
      <div className="border-t border-slate-100 p-3">
        <button className="w-full text-center text-sm text-brand-600 hover:text-brand-700 font-bold">
          عرض كل الرسائل
        </button>
      </div>
    </div>
  );
}

function UserMenu({
  email,
  onLogout,
}: {
  email: string | undefined;
  onLogout: () => void;
}) {
  return (
    <div>
      <div className="p-4 border-b border-slate-100 text-right">
        <div className="text-sm font-bold text-slate-800 truncate" title={email}>
          {email ?? "المستخدم"}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">حساب نشط</div>
      </div>
      <ul className="py-2">
        <MenuLink to="/profile" icon={User} label="الملف الشخصي" />
        <MenuLink to="/admin" icon={Settings} label="إعدادات الحساب" />
        <MenuLink to="/theme" icon={Palette} label="تخصيص الواجهة" />
      </ul>
      <div className="border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 transition text-right"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

function MenuLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
      >
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="flex-1">{label}</span>
      </Link>
    </li>
  );
}
