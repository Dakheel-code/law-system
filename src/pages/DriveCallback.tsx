import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { exchangeCode } from "../lib/drive";

type Status = "loading" | "success" | "error";

export default function DriveCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("جاري ربط Google Drive...");
  const [email, setEmail] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode guard
    ran.current = true;

    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setStatus("error");
      setMessage(`أُلغيت العملية: ${errorParam}`);
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("لم يصل رمز التفويض من Google");
      return;
    }

    (async () => {
      try {
        const { connectedEmail } = await exchangeCode(code);
        setEmail(connectedEmail);
        setStatus("success");
        setMessage("تم ربط Google Drive بنجاح");
        setTimeout(() => navigate("/admin?tab=drive", { replace: true }), 1800);
      } catch (e) {
        setStatus("error");
        setMessage((e as Error).message || "فشل ربط Drive");
      }
    })();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="card max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-brand-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              يتم الاتصال بـ Google Drive
            </h2>
            <p className="text-sm text-slate-500">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">{message}</h2>
            {email && (
              <p className="text-sm text-slate-500" dir="ltr">
                {email}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-3">جاري التوجيه...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              فشل الربط
            </h2>
            <p className="text-sm text-slate-500 mb-4">{message}</p>
            <button
              onClick={() => navigate("/admin?tab=drive", { replace: true })}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
            >
              العودة للإعدادات
            </button>
          </>
        )}
      </div>
    </div>
  );
}
