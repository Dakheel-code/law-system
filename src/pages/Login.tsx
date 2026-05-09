import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth, isSupabaseConfigured } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError(translateError(error));
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-bl from-brand-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-sky-100/60 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          {theme.logoDataUrl ? (
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src={theme.logoDataUrl}
                alt="logo"
                className="max-h-20 max-w-[180px] object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 text-white shadow-lg mb-4">
              <Scale className="w-8 h-8" strokeWidth={2} />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-slate-800">{theme.officeName}</h1>
          <p className="text-sm text-slate-500 mt-1">سجّل دخولك للوصول إلى لوحة التحكم</p>
        </div>

        <div className="card p-7 shadow-xl">
          {!isSupabaseConfigured && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-right flex-1">
                <p className="font-bold">Supabase غير مهيّأ</p>
                <p className="mt-1 leading-5">
                  أضف <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> و{" "}
                  <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> في
                  ملف <code className="bg-amber-100 px-1 rounded">.env.local</code> ثم أعد تشغيل الخادم.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white"
                  dir="ltr"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                نسيت كلمة المرور؟
              </a>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-slate-600">تذكرني</span>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-brand-500"
                />
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-right flex-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !isSupabaseConfigured}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 {theme.officeName} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  if (m.includes("email not confirmed")) return "لم يتم تأكيد البريد الإلكتروني بعد";
  if (m.includes("rate limit")) return "محاولات كثيرة. حاول بعد قليل";
  if (m.includes("network")) return "تعذّر الاتصال بالخادم. تحقق من الإنترنت";
  return msg;
}
