import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import DriveBrowser from "../components/drive/DriveBrowser";
import { ensureOfficeFolders } from "../lib/drive";

const ROOT_LABEL = "ناصر طريد";

export default function Attachments() {
  const [rootId, setRootId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { rootId } = await ensureOfficeFolders();
        if (!cancelled) setRootId(rootId);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="card p-8 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
        <div className="text-right flex-1">
          <h3 className="text-sm font-bold text-rose-700">
            تعذّر تجهيز مجلدات Drive
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-mono" dir="ltr">
            {error}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            تحقق من حالة الربط في{" "}
            <a href="/admin?tab=drive" className="text-brand-600 hover:underline">
              إعدادات Google Drive
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!rootId) {
    return (
      <div className="card p-16 flex flex-col items-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm">جاري تجهيز Drive...</span>
      </div>
    );
  }

  return <DriveBrowser rootFolder={{ id: rootId, name: ROOT_LABEL }} />;
}
