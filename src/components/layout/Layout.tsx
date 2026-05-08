import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 pb-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-brand-600">
          الدعم
        </a>
        <a href="#" className="hover:text-brand-600">
          حول
        </a>
      </div>
      <div>© 2026 بواسطة شركة ناصر طريد للمحاماة</div>
    </footer>
  );
}
