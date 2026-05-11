// Reusable Drive folder browser.
//
// Renders the contents of a single Drive folder (the `rootFolder` prop) and
// lets the user navigate into subfolders, upload, create folders, move
// items, preview files, and delete. Locked to `rootFolder` — the breadcrumb
// "Home" returns to the root, not above it.
//
// Use it in three places:
//   - `<Attachments>` page (root = ناصر طريد / Shared Drive)
//   - Case detail (root = the case's auto-created folder)
//   - Client profile (root = the client's auto-created folder)

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
  Download,
} from "lucide-react";
import {
  listFiles,
  uploadFile,
  createSubfolder,
  deleteFile,
  moveItem,
  type DriveFile,
} from "../../lib/drive";

const DRAG_MIME = "application/x-drive-item";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const MAX_FILE_MB = 10;

type Crumb = { id: string; name: string };

type Props = {
  rootFolder: { id: string; name: string };
  /** Render the page-level "المرفقات" heading. Default true. */
  showHeader?: boolean;
  /** Override the page-level heading text. */
  headerTitle?: string;
};

const fmtSize = (n: number) => {
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function DriveBrowser({
  rootFolder,
  showHeader = true,
  headerTitle = "المرفقات",
}: Props) {
  const [path, setPath] = useState<Crumb[]>([{ id: rootFolder.id, name: rootFolder.name }]);
  const [items, setItems] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverCrumbIdx, setDragOverCrumbIdx] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentFolder = path[path.length - 1];

  // Reset the path when the root prop changes (e.g. switching between cases)
  useEffect(() => {
    setPath([{ id: rootFolder.id, name: rootFolder.name }]);
  }, [rootFolder.id, rootFolder.name]);

  // List the current folder whenever path changes
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

  // Filter + split into folders and files
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const folders = filtered.filter((i) => i.mimeType === FOLDER_MIME);
  const files = filtered.filter((i) => i.mimeType !== FOLDER_MIME);

  // Navigation — locked to the root folder
  const enter = (folder: DriveFile) =>
    setPath((p) => [...p, { id: folder.id, name: folder.name }]);
  const jumpTo = (i: number) => setPath((p) => p.slice(0, i + 1));
  const goHome = () => setPath((p) => p.slice(0, 1));

  // Actions
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
    let anySuccess = false;
    try {
      for (const f of Array.from(fl)) {
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          alert(`${f.name} — يتجاوز ${MAX_FILE_MB} ميجابايت`);
          continue;
        }
        try {
          const uploaded = await uploadFile(currentFolder.id, f);
          setItems((prev) => [uploaded, ...prev.filter((p) => p.id !== uploaded.id)]);
          anySuccess = true;
        } catch (e) {
          console.error("[Drive upload]", f.name, e);
          alert(`فشل رفع ${f.name}:\n${(e as Error).message}`);
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (anySuccess) void refresh();
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !currentFolder) return;
    try {
      const created = await createSubfolder(currentFolder.id, name);
      setNewFolderName("");
      setShowCreate(false);
      setItems((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      void refresh();
    } catch (e) {
      alert(`فشل إنشاء المجلد: ${(e as Error).message}`);
    }
  };

  const handleDeleteItem = async (item: DriveFile) => {
    const what = item.mimeType === FOLDER_MIME ? "المجلد" : "الملف";
    const extra =
      item.mimeType === FOLDER_MIME ? "\nسيتم حذف كل محتوياته أيضاً." : "";
    if (!confirm(`حذف ${what} "${item.name}"؟${extra}\nهذا الإجراء نهائي.`)) return;
    try {
      await deleteFile(item.id);
      await refresh();
    } catch (e) {
      alert(`فشل الحذف: ${(e as Error).message}`);
    }
  };

  const handleMove = async (itemId: string, toFolderId: string) => {
    if (!currentFolder || itemId === toFolderId) return;
    try {
      await moveItem(itemId, currentFolder.id, toFolderId);
      await refresh();
    } catch (e) {
      console.error("[Drive move]", e);
      alert(`فشل نقل العنصر:\n${(e as Error).message}`);
    } finally {
      setDraggingId(null);
      setDragOverFolderId(null);
      setDragOverCrumbIdx(null);
    }
  };

  // Drag and drop (external files → upload)
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
    if (!e.dataTransfer.types.includes("Files")) return;
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
        <div className="absolute inset-0 z-40 bg-brand-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none rounded-2xl">
          <div className="bg-white rounded-3xl border-4 border-dashed border-brand-500 px-12 py-10 flex flex-col items-center shadow-card-hover">
            <UploadCloud className="w-20 h-20 text-brand-500 mb-3" strokeWidth={1.2} />
            <p className="text-lg font-extrabold text-brand-700">
              أفلت الملفات في «{currentFolder?.name ?? "..."}»
            </p>
          </div>
        </div>
      )}

      {showHeader && (
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
            {headerTitle}
            <Paperclip className="w-5 h-5 text-brand-500" />
          </h2>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Breadcrumb + inline actions + search bar */}
      <div className="card p-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={refresh}
          title="تحديث"
          disabled={loading || !currentFolder}
          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <Breadcrumb
          path={path}
          onJump={jumpTo}
          onHome={goHome}
          dragOverIdx={dragOverCrumbIdx}
          onCrumbDragOver={(i) => setDragOverCrumbIdx(i)}
          onCrumbDragLeave={() => setDragOverCrumbIdx(null)}
          onCrumbDrop={(itemId, i) => {
            const target = path[i];
            if (target) handleMove(itemId, target.id);
          }}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowCreate(true)}
            disabled={!currentFolder}
            title="مجلد جديد في الموقع الحالي"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-brand-300 text-brand-700 rounded-md text-xs font-bold hover:bg-brand-50 disabled:opacity-50"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            مجلد جديد
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!currentFolder || uploading}
            title="رفع ملف للموقع الحالي"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-md text-xs font-bold shadow-sm hover:bg-brand-600 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            رفع
          </button>
        </div>

        <div className="relative flex-1 min-w-[180px]">
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
                    isDragging={draggingId === f.id}
                    isDropTarget={dragOverFolderId === f.id}
                    onOpen={() => enter(f)}
                    onDelete={() => handleDeleteItem(f)}
                    onDragStart={() => setDraggingId(f.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverFolderId(null);
                    }}
                    onDragOver={() => setDragOverFolderId(f.id)}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={(itemId) => handleMove(itemId, f.id)}
                  />
                ))}
              </div>
            </Section>
          )}
          {files.length > 0 && (
            <Section title="الملفات" count={files.length}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {files.map((f, i) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    isDragging={draggingId === f.id}
                    onPreview={() => setPreviewIdx(i)}
                    onDelete={() => handleDeleteItem(f)}
                    onDragStart={() => setDraggingId(f.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

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

      {previewIdx !== null && files[previewIdx] && (
        <FilePreview
          file={files[previewIdx]}
          hasPrev={previewIdx > 0}
          hasNext={previewIdx < files.length - 1}
          onPrev={() => setPreviewIdx((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() =>
            setPreviewIdx((i) => (i !== null && i < files.length - 1 ? i + 1 : i))
          }
          onClose={() => setPreviewIdx(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Subcomponents
// ============================================================

function Breadcrumb({
  path,
  onJump,
  onHome,
  dragOverIdx,
  onCrumbDragOver,
  onCrumbDragLeave,
  onCrumbDrop,
}: {
  path: Crumb[];
  onJump: (i: number) => void;
  onHome: () => void;
  dragOverIdx: number | null;
  onCrumbDragOver: (i: number) => void;
  onCrumbDragLeave: () => void;
  onCrumbDrop: (itemId: string, i: number) => void;
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
        const isDropTarget = !isLast && dragOverIdx === i;
        return (
          <div key={c.id} className="flex items-center gap-1 shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
            <button
              onClick={() => onJump(i)}
              disabled={isLast}
              onDragOver={(e) => {
                if (isLast) return;
                if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverIdx !== i) onCrumbDragOver(i);
              }}
              onDragLeave={onCrumbDragLeave}
              onDrop={(e) => {
                if (isLast) return;
                const data = e.dataTransfer.getData(DRAG_MIME);
                if (!data) return;
                e.preventDefault();
                try {
                  const parsed = JSON.parse(data) as { id: string };
                  onCrumbDrop(parsed.id, i);
                } catch {
                  /* ignore */
                }
              }}
              className={`px-2 py-1 rounded-md text-sm transition truncate max-w-[160px] ${
                isDropTarget
                  ? "bg-brand-100 text-brand-800 ring-2 ring-brand-400"
                  : isLast
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
  isDragging,
  isDropTarget,
  onOpen,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  folder: DriveFile;
  isDragging: boolean;
  isDropTarget: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (itemId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          DRAG_MIME,
          JSON.stringify({ id: folder.id, name: folder.name, type: "folder" })
        );
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDragLeave={(e) => {
        if ((e.currentTarget as Node).contains(e.relatedTarget as Node)) return;
        onDragLeave();
      }}
      onDrop={(e) => {
        const data = e.dataTransfer.getData(DRAG_MIME);
        if (!data) return;
        e.preventDefault();
        try {
          const parsed = JSON.parse(data) as { id: string };
          if (parsed.id !== folder.id) onDrop(parsed.id);
        } catch {
          /* ignore */
        }
        onDragLeave();
      }}
      className={`group relative card p-3 cursor-pointer transition flex flex-col items-center text-center ${
        isDragging ? "opacity-40" : ""
      } ${
        isDropTarget
          ? "border-brand-500 ring-4 ring-brand-200 bg-brand-50/60"
          : "hover:border-brand-300 hover:shadow-md"
      }`}
    >
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

function FileCard({
  file,
  isDragging,
  onPreview,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  file: DriveFile;
  isDragging: boolean;
  onPreview: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const isImage = file.mimeType.startsWith("image/");
  const thumb =
    file.thumbnailLink?.replace(/=s\d+$/, "=s400") ?? file.thumbnailLink;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          DRAG_MIME,
          JSON.stringify({ id: file.id, name: file.name, type: "file" })
        );
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onPreview}
      className={`group relative card overflow-hidden cursor-pointer transition hover:border-brand-300 hover:shadow-md flex flex-col ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 bg-white/95 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md shadow-sm"
          title="حذف"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {file.webViewLink && (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 bg-white/95 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-md shadow-sm"
            title="فتح في Drive"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {isImage && thumb ? (
          <img
            src={thumb}
            alt={file.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <BigFileIcon mimeType={file.mimeType} />
        )}
      </div>

      <div className="p-2.5 text-right">
        <div
          className="text-xs font-bold text-slate-700 truncate group-hover:text-brand-700"
          title={file.name}
        >
          {file.name}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
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
    </div>
  );
}

function BigFileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return (
      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-rose-600" strokeWidth={1.5} />
      </div>
    );
  }
  if (mimeType.startsWith("image/")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-violet-600" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
      <FileType className="w-8 h-8 text-brand-600" strokeWidth={1.5} />
    </div>
  );
}

function FilePreview({
  file,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  file: DriveFile;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasNext) onNext();
      else if (e.key === "ArrowRight" && hasPrev) onPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [hasPrev, hasNext, onPrev, onNext, onClose]);

  const isImage = file.mimeType.startsWith("image/");
  const previewUrl = `https://drive.google.com/file/d/${encodeURIComponent(
    file.id
  )}/preview`;
  const imageUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
    file.id
  )}&sz=w2000`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between p-3 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          {file.webViewLink && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-md text-xs font-bold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              فتح في Drive
            </a>
          )}
          <a
            href={`https://drive.google.com/uc?id=${encodeURIComponent(
              file.id
            )}&export=download`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-md text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            تحميل
          </a>
        </div>
        <div className="text-right min-w-0 flex-1 mr-4">
          <div className="text-sm font-bold text-white truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-[11px] text-white/50 mt-0.5 flex items-center justify-end gap-1.5">
            {file.size && <span>{fmtSize(Number(file.size))}</span>}
            {file.size && file.modifiedTime && (
              <span className="text-white/30">·</span>
            )}
            {file.modifiedTime && (
              <span>
                {new Date(file.modifiedTime).toLocaleDateString("ar-EG-u-nu-latn")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full"
            title="السابق"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
        )}

        {isImage ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
              const iframe = img.parentElement?.querySelector("iframe");
              if (iframe) (iframe as HTMLIFrameElement).style.display = "block";
            }}
          />
        ) : null}
        <iframe
          src={previewUrl}
          title={file.name}
          allow="autoplay"
          className={`bg-white rounded-lg shadow-2xl ${
            isImage ? "hidden" : "w-full h-full max-w-5xl"
          }`}
        />

        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full"
            title="التالي"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

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
      <HardDrive className="w-16 h-16 text-slate-300 mb-3" strokeWidth={1.2} />
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
