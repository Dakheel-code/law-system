import { useEffect, useMemo, useRef, useState } from "react";
import {
  Paperclip,
  UploadCloud,
  FolderPlus,
  ChevronLeft,
  HardDrive,
  Search,
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  FileType,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Home,
  RefreshCw,
} from "lucide-react";
import {
  listFiles,
  ensureOfficeFolders,
  uploadFile,
  createSubfolder,
  deleteFile,
  type DriveFile,
} from "../lib/drive";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const MAX_FILE_MB = 10;
const ROOT_LABEL = "ناصر طريد";

type Crumb = { id: string; name: string };

const fmtSize = (n: number) => {
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function Attachments() {
  const [path, setPath] = useState<Crumb[]>([]);
  const [items, setItems] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const currentFolder = path[path.length - 1];

  // ---- Initial load: ensure root folders exist, set starting path
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { rootId } = await ensureOfficeFolders();
        if (!cancelled) setPath([{ id: rootId, name: ROOT_LABEL }]);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- List the current folder whenever path changes
  useEffect(() => {
    if (!currentFolder) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listFiles(currentFolder.id)
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentFolder?.id]);

  // ---- Filter + split into folders and files
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const folders = filtered.filter((i) => i.mimeType === FOLDER_MIME);
  const files = filtered.filter((i) => i.mimeType !== FOLDER_MIME);

  // ---- Navigation
  const enter = (folder: DriveFile) =>
    setPath((p) => [...p, { id: folder.id, name: folder.name }]);
  const jumpTo = (i: number) => setPath((p) => p.slice(0, i + 1));
  const goHome = () => setPath((p) => p.slice(0, 1));

  // ---- Actions
  const refresh = async () => {
    if (!currentFolder) return;
    setLoading(true);
    try {
      setItems(await listFiles(currentFolder.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (fl: FileList | null) => {
    if (!fl || !currentFolder) return;
    setUploading(true);
    let failed = 0;
    try {
      for (const f of Array.from(fl)) {
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          alert(`${f.name} — يتجاوز ${MAX_FILE_MB} ميجابايت`);
          failed++;
          continue;
        }
        try {
          await uploadFile(currentFolder.id, f);
        } catch (e) {
          console.error("[Drive upload]", f.name, e);
          alert(`فشل رفع ${f.name}:\n${(e as Error).message}`);
          failed++;
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (failed < (fl?.length ?? 0)) await refresh();
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !currentFolder) return;
    try {
      await createSubfolder(currentFolder.id, name);
      setNewFolderName("");
      setShowCreate(false);
      await refresh();
    } catch (e) {
      alert(`فشل إنشاء المجلد: ${(e as Error).message}`);
    }
  };

  const handleDeleteItem = async (item: DriveFile) => {
    const what = item.mimeType === FOLDER_MIME ? "المجلد" : "الملف";
    const extra =
      item.mimeType === FOLDER_MIME
        ? "\nسيتم حذف كل محتوياته أيضاً."
        : "";
    if (!confirm(`حذف ${what} "${item.name}"؟${extra}\nهذا الإجراء نهائي.`)) return;
    try {
      await deleteFile(item.id);
      await refresh();
    } catch (e) {
      alert(`فشل الحذف: ${(e as Error).message}`);
    }
  };

  // ---- Drag and drop
  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      if (!dragOver) setDragOver(true);
    }
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const isEmpty = !loading && !error && filtered.length === 0;

  return (
    <div
      className="space-y-4 relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-40 bg-brand-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl border-4 border-dashed border-brand-500 px-12 py-10 flex flex-col items-center shadow-card-hover">
            <UploadCloud
              className="w-20 h-20 text-brand-500 mb-3"
              strokeWidth={1.2}
            />
            <p className="text-lg font-extrabold text-brand-700">
              أفلت الملفات في «{currentFolder?.name ?? "..."}»
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            disabled={!currentFolder}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4" />
            مجلد جديد
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!currentFolder || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {uploading ? "جارٍ الرفع..." : "رفع ملف"}
          </button>
        </div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          المرفقات
          <Paperclip className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Breadcrumb + search bar */}
      <div className="card p-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={refresh}
          title="تحديث"
          disabled={loading || !currentFolder}
          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <Breadcrumb path={path} onJump={jumpTo} onHome={goHome} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في هذا المجلد..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="card p-8 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-right flex-1">
            <h3 className="text-sm font-bold text-rose-700">حدث خطأ</h3>
            <p className="text-xs text-slate-600 mt-1 font-mono" dir="ltr">
              {error}
            </p>
            <button
              onClick={refresh}
              className="mt-3 text-xs font-bold text-brand-600 hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="card p-16 flex flex-col items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-sm">جاري التحميل...</span>
        </div>
      ) : isEmpty ? (
        <EmptyState
          searching={search.trim() !== ""}
          onUpload={() => fileRef.current?.click()}
          onCreateFolder={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-5">
          {folders.length > 0 && (
            <Section title="المجلدات" count={folders.length}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map((f) => (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    onOpen={() => enter(f)}
                    onDelete={() => handleDeleteItem(f)}
                  />
                ))}
              </div>
            </Section>
          )}
          {files.length > 0 && (
            <Section title="الملفات" count={files.length}>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {files.map((f) => (
                  <FileRow
                    key={f.id}
                    file={f}
                    onDelete={() => handleDeleteItem(f)}
                  />
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Create folder modal */}
      {showCreate && (
        <CreateFolderModal
          value={newFolderName}
          onChange={setNewFolderName}
          onCancel={() => {
            setShowCreate(false);
            setNewFolderName("");
          }}
          onConfirm={handleCreateFolder}
          parentName={currentFolder?.name ?? ""}
        />
      )}
    </div>
  );
}

// ============================================================
// Breadcrumb
// ============================================================
function Breadcrumb({
  path,
  onJump,
  onHome,
}: {
  path: Crumb[];
  onJump: (i: number) => void;
  onHome: () => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 scrollbar-thin">
      <button
        onClick={onHome}
        title="الجذر"
        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md shrink-0"
      >
        <Home className="w-4 h-4" />
      </button>
      {path.map((c, i) => {
        const isLast = i === path.length - 1;
        return (
          <div key={c.id} className="flex items-center gap-1 shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
            <button
              onClick={() => onJump(i)}
              disabled={isLast}
              className={`px-2 py-1 rounded-md text-sm transition truncate max-w-[160px] ${
                isLast
                  ? "text-slate-800 font-bold cursor-default"
                  : "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
              }`}
              title={c.name}
            >
              {c.name}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Sections + cards
// ============================================================
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs text-slate-400">
          <bdi dir="ltr">{count}</bdi>
        </span>
        <h3 className="text-sm font-bold text-slate-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FolderCard({
  folder,
  onOpen,
  onDelete,
}: {
  folder: DriveFile;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative card p-3 cursor-pointer hover:border-brand-300 hover:shadow-md transition flex flex-col items-center text-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 left-2 p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition"
        title="حذف"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onOpen} className="flex flex-col items-center w-full">
        <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition">
          <FolderIcon className="w-7 h-7 fill-amber-100" strokeWidth={1.5} />
        </div>
        <div
          className="text-sm font-bold text-slate-700 truncate w-full"
          title={folder.name}
        >
          {folder.name}
        </div>
        {folder.modifiedTime && (
          <div className="text-[10px] text-slate-400 mt-1">
            {new Date(folder.modifiedTime).toLocaleDateString("ar-EG-u-nu-latn")}
          </div>
        )}
      </button>
    </div>
  );
}

function FileRow({
  file,
  onDelete,
}: {
  file: DriveFile;
  onDelete: () => void;
}) {
  return (
    <li className="card p-3 flex items-center gap-3 group hover:border-brand-300 transition">
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onDelete}
          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
          title="حذف"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {file.webViewLink && (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-brand-500 hover:text-brand-700 hover:bg-brand-50 rounded-md"
            title="فتح في Drive"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <a
        href={file.webViewLink || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 text-right flex items-center gap-2"
      >
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-bold text-slate-700 truncate group-hover:text-brand-700"
            title={file.name}
          >
            {file.name}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-1.5">
            {file.size && <span>{fmtSize(Number(file.size))}</span>}
            {file.size && file.modifiedTime && (
              <span className="text-slate-300">·</span>
            )}
            {file.modifiedTime && (
              <span>
                {new Date(file.modifiedTime).toLocaleDateString("ar-EG-u-nu-latn")}
              </span>
            )}
          </div>
        </div>
        <FileBadge mimeType={file.mimeType} />
      </a>
    </li>
  );
}

function FileBadge({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return (
      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-5 h-5 text-violet-600" />
      </div>
    );
  }
  if (mimeType === "application/pdf") {
    return (
      <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-5 h-5 text-brand-600" />
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================
function EmptyState({
  searching,
  onUpload,
  onCreateFolder,
}: {
  searching: boolean;
  onUpload: () => void;
  onCreateFolder: () => void;
}) {
  if (searching) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.2} />
        <h3 className="text-base font-bold text-slate-700">
          لا توجد نتائج للبحث
        </h3>
      </div>
    );
  }
  return (
    <div className="card p-12 flex flex-col items-center text-center border-2 border-dashed">
      <HardDrive
        className="w-16 h-16 text-slate-300 mb-3"
        strokeWidth={1.2}
      />
      <h3 className="text-base font-bold text-slate-700">هذا المجلد فارغ</h3>
      <p className="text-sm text-slate-500 mt-1 mb-5">
        ارفع ملفاً أو أنشئ مجلداً فرعياً للبدء
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateFolder}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"
        >
          <FolderPlus className="w-4 h-4" />
          مجلد جديد
        </button>
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <UploadCloud className="w-4 h-4" />
          رفع ملف
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Create folder modal
// ============================================================
function CreateFolderModal({
  value,
  onChange,
  onCancel,
  onConfirm,
  parentName,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  parentName: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-800">
            مجلد جديد
            <FolderPlus className="w-4 h-4 text-brand-500" />
          </h2>
        </div>
        <p className="text-xs text-slate-500 text-right mb-3">
          داخل: <span className="font-bold text-slate-700">{parentName}</span>
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onConfirm();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="اسم المجلد"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 text-right"
        />
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={!value.trim()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إنشاء
          </button>
        </div>
      </div>
    </div>
  );
}
