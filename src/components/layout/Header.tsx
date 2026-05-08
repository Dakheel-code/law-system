import { Search, Sun, MessageSquare, Bell, Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 px-6 flex items-center gap-4 sticky top-0 z-10 bg-slate-50/80 backdrop-blur">
      {/* Search */}
      <div className="flex-1 max-w-3xl">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            placeholder="ابحث في العملاء، المستخدمين، القضايا والمهام.."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mr-auto">
        <IconBtn icon={Calendar} />
        <IconBtn icon={Bell} dot />
        <IconBtn icon={MessageSquare} />
        <IconBtn icon={Sun} />
        <button className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <span className="text-sm">👤</span>
        </button>
      </div>
    </header>
  );
}

function IconBtn({
  icon: Icon,
  dot,
}: {
  icon: React.ComponentType<{ className?: string }>;
  dot?: boolean;
}) {
  return (
    <button className="relative w-11 h-11 rounded-full bg-white border border-slate-200 shadow-card flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition">
      <Icon className="w-5 h-5" />
      {dot && (
        <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500" />
      )}
    </button>
  );
}
