import { useEffect, useState } from "react";
import {
  HardDrive,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
  FolderTree,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  buildAuthUrl,
  disconnectDrive,
  ensureOfficeFolders,
} from "../../lib/drive";

type ConnectionStatus = {
  connected: boolean;
  email?: string | null;
  rootFolderId?: string | null;
  casesFolderId?: string | null;
  clientsFolderId?: string | null;
  connectedAt?: string | null;
};

export default function DriveSection() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!supabase) {
      setError("Supabase غير مهيّأ — تحقّق من ملف البيئة");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: e } = await supabase.rpc("drive_connection_status");
    setLoading(false);
    if (e) {
      setError(e.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setStatus({
      connected: !!row,
      email: row?.connected_email ?? null,
      rootFolderId: row?.root_folder_id ?? null,
      casesFolderId: row?.cases_folder_id ?? null,
      clientsFolderId: row?.clients_folder_id ?? null,
      connectedAt: row?.connected_at ?? null,
    });
    setError(null);
  };

  useEffect(() => {
    load();
    // Realtime: reload on remote changes
    const sb = supabase;
    if (!sb) return;
    const ch = sb
      .channel(`drive-conn-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "drive_connection" },
        () => load()
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  const handleConnect = () => {
    try {
      window.location.href = buildAuthUrl();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("هل تريد فصل ربط Google Drive؟ الملفات لن تُحذف من Drive.")) return;
    setBusy(true);
    try {
      await disconnectDrive();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleInitFolders = async () => {
    setBusy(true);
    setError(null);
    try {
      await ensureOfficeFolders();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const missingEnv = !clientId;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 justify-end">
            تكامل Google Drive
            <HardDrive className="w-5 h-5 text-brand-500" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-5">
            عند الربط ستُرفع كل المرفقات تلقائياً إلى Drive داخل المجلد:
            <span className="font-bold text-slate-700 mx-1" dir="ltr">
              ناصر طريد/قضايا/&lt;رقم القضية&gt;
            </span>
            أو
            <span className="font-bold text-slate-700 mx-1" dir="ltr">
              ناصر طريد/عملاء/&lt;رقم العميل&gt;
            </span>
          </p>
        </div>
      </div>

      {missingEnv && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-right flex-1">
            <div className="font-bold text-amber-800 text-sm">
              مفتاح Google غير مضبوط
            </div>
            <div className="text-xs text-amber-700 mt-1 leading-5">
              أضف{" "}
              <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                VITE_GOOGLE_CLIENT_ID
              </code>{" "}
              في ملف <code>.env.local</code> (للتطوير) وفي Netlify Environment
              Variables (للإنتاج).
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-right flex-1">
            <div className="font-bold text-rose-800 text-sm">حدث خطأ</div>
            <div className="text-xs text-rose-700 mt-1 font-mono" dir="ltr">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Status card */}
      <div className="card p-5">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">جاري التحميل...</span>
          </div>
        ) : status.connected ? (
          <ConnectedView
            status={status}
            busy={busy}
            onDisconnect={handleDisconnect}
            onInitFolders={handleInitFolders}
          />
        ) : (
          <DisconnectedView onConnect={handleConnect} disabled={missingEnv} />
        )}
      </div>

      {/* How it works */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-slate-800 mb-3 text-right flex items-center gap-2 justify-end">
          كيف يعمل؟
          <FolderTree className="w-4 h-4 text-brand-500" />
        </h4>
        <ol className="text-xs text-slate-600 space-y-2 leading-6 text-right list-decimal pr-5">
          <li>تربط حساب Google Drive الخاص بالمكتب مرة واحدة فقط.</li>
          <li>
            يقوم النظام تلقائياً بإنشاء مجلد جذر بمسمى{" "}
            <span className="font-bold text-slate-700">«ناصر طريد»</span> ومجلدين
            فرعيين: «قضايا» و «عملاء».
          </li>
          <li>
            عند رفع ملف من صفحة قضية، يُنشأ مجلد بـ <code>رقم القضية</code> تلقائياً
            تحت «قضايا»، ويُرفع الملف داخله.
          </li>
          <li>نفس الشيء عند رفع ملف من صفحة عميل — يذهب تحت «عملاء».</li>
          <li>
            النطاق المستخدم <code className="font-mono">drive.file</code> يعني أن
            النظام يرى ويتعامل فقط مع الملفات التي ينشئها هو — لا يصل لملفات
            Drive الأخرى.
          </li>
        </ol>
      </div>
    </div>
  );
}

function DisconnectedView({
  onConnect,
  disabled,
}: {
  onConnect: () => void;
  disabled: boolean;
}) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <HardDrive className="w-7 h-7 text-slate-400" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">
        Drive غير مربوط
      </h4>
      <p className="text-sm text-slate-500 mb-5">
        اضغط الزر أدناه للسماح للنظام بإنشاء وإدارة ملفات المكتب في Drive
      </p>
      <button
        onClick={onConnect}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn className="w-4 h-4" />
        ربط Google Drive
      </button>
    </div>
  );
}

function ConnectedView({
  status,
  busy,
  onDisconnect,
  onInitFolders,
}: {
  status: ConnectionStatus;
  busy: boolean;
  onDisconnect: () => void;
  onInitFolders: () => void;
}) {
  const foldersReady =
    !!status.rootFolderId && !!status.casesFolderId && !!status.clientsFolderId;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">Drive مربوط</div>
            {status.email && (
              <div className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                {status.email}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onDisconnect}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          فصل
        </button>
      </div>

      {/* Folder status */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
        <div className="text-xs font-bold text-slate-500 mb-2 text-right">
          هيكل المجلدات في Drive
        </div>
        <FolderRow
          label="ناصر طريد (الجذر)"
          id={status.rootFolderId}
        />
        <FolderRow
          label="↳ قضايا"
          id={status.casesFolderId}
          indent
        />
        <FolderRow
          label="↳ عملاء"
          id={status.clientsFolderId}
          indent
        />
        {!foldersReady && (
          <button
            onClick={onInitFolders}
            disabled={busy}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-100 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FolderTree className="w-3.5 h-3.5" />
            )}
            إنشاء/تحقّق من المجلدات الآن
          </button>
        )}
      </div>

      {status.connectedAt && (
        <div className="text-xs text-slate-400 text-right">
          ربط في:{" "}
          <span dir="ltr">
            {new Date(status.connectedAt).toLocaleString("ar-SA")}
          </span>
        </div>
      )}
    </div>
  );
}

function FolderRow({
  label,
  id,
  indent,
}: {
  label: string;
  id: string | null | undefined;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-xs ${
        indent ? "mr-4" : ""
      }`}
    >
      <span
        className={
          id
            ? "text-emerald-600 font-bold inline-flex items-center gap-1"
            : "text-slate-400"
        }
      >
        {id ? <CheckCircle2 className="w-3 h-3" /> : "—"}
        {id ? "موجود" : "لم يُنشأ بعد"}
      </span>
      <span className="flex items-center gap-2 text-slate-700">
        {id && (
          <a
            href={`https://drive.google.com/drive/folders/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-600"
            title="افتح في Drive"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <span className="font-medium">{label}</span>
      </span>
    </div>
  );
}
