import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Auto-close drawer on route change (mobile UX)
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Backdrop — only visible on mobile when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 lg:px-6 pb-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-4 lg:px-6 py-4 flex items-center justify-end text-xs text-slate-400 border-t border-slate-100">
      <FooterCopyright />
    </footer>
  );
}

function FooterCopyright() {
  const { theme } = useTheme();
  return <div>© 2026 بواسطة {theme.officeName}</div>;
}
