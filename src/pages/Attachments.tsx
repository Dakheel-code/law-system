import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Paperclip,
  Plus,
  Search,
  RotateCcw,
  Trash2,
  Eye,
  Download,
  FileText,
  Image as ImageIcon,
  FileType,
  UploadCloud,
  AlertCircle,
  Files,
  HardDrive,
} from "lucide-react";
import {
  useCases,
  removeAttachmentFromCase,
  type CaseAttachment,
} from "../lib/caseStore";
import AttachmentsFormModal from "../components/attachments/AttachmentsFormModal";

type EnrichedAttachment = CaseAttachment & {
  caseId: string;
  caseCode: string;
  caseNumber: string;
  caseTitle: string;
  indexInCase: number;
};

type FileFilter = "all" | "pdf" | "image" | "doc";

const MAX_FILE_MB = 10;

const fmtSize = (n: number) => {
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const matchesKind = (type: string, kind: FileFilter) => {
  if (kind === "all") return true;
  if (kind === "pdf") return type === "application/pdf";
  if (kind === "image") return type.startsWith("image/");
  if (kind === "doc")
    return (
      type.includes("word") ||
      type.includes("officedocument") ||
      type === "application/msword"
    );
  return true;
};

export default function Attachments() {
  const { cases, loading } = useCases();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<FileFilter>("all");
  const [openModal, setOpenModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dropOver, setDropOver] = useState(false);

  const allAttachments = useMemo<EnrichedAttachment[]>(() => {
    const list: EnrichedAttachment[] = [];
    cases.forEach((c) => {
      (c.attachments ?? []).forEach((a, idx) => {
        list.push({
          ...a,
          caseId: c.id,
          caseCode: c.code,
          caseNumber: c.caseNumber ?? "",
          caseTitle: c.requestTitle || c.code,
          indexInCase: idx,
        });
      });
    });
    return list.reverse(); // newest first within each case (rough order)
  }, [cases]);

  const totalSize = allAttachments.reduce((s, a) => s + a.size, 0);
  const pdfCount = allAttachments.filter((a) => a.type === "application/pdf")
    .length;
  const imageCount = allAttachments.filter((a) =>
    a.type.startsWith("image/")
  ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAttachments.filter((a) => {
      if (!matchesKind(a.type, kindFilter)) return false;
      if (q) {
        const hay = [a.name, a.caseTitle, a.caseCode, a.caseNumber]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allAttachments, search, kindFilter]);

  const handleDelete = async (a: EnrichedAttachment) => {
    if (
      !confirm(
        `هل تريد حذف الملف "${a.name}" من قضية «${a.caseTitle}»؟ سيُحذف من Google Drive أيضاً.`
      )
    )
      return;
    if (a.driveFileId) {
      try {
        const { deleteFile } = await import("../lib/drive");
        await deleteFile(a.driveFileId);
      } catch (e) {
        console.warn("Drive delete failed:", e);
      }
    }
    await removeAttachmentFromCase(a.caseId, a.indexInCase);
  };

  const onReset = () => {
    setSearch("");
    setKindFilter("all");
  };
  const hasFilters = search !== "" || kindFilter !== "all";

  // Page-level drag-drop: highlights and opens the modal (user picks case there).
  const onPageDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      if (!dropOver) setDropOver(true);
    }
  };
  const onPageDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropOver(false);
  };
  const onPageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    setPendingFiles(files);
    setOpenModal(true);
  };

  // Quick upload via button (no case selected) — just opens modal
  const quickAdd = () => {
    setPendingFiles([]);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setPendingFiles([]);
  };

  return (
    <div
      className="space-y-5 relative"
      onDragOver={onPageDragOver}
      onDragLeave={onPageDragLeave}
      onDrop={onPageDrop}
    >
      {/* Page-wide drop overlay */}
      {dropOver && (
        <div className="fixed inset-0 z-40 bg-brand-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl border-4 border-dashed border-brand-500 px-12 py-10 flex flex-col items-center shadow-card-hover">
            <UploadCloud
              className="w-20 h-20 text-brand-500 mb-3"
              strokeWidth={1.2}
            />
            <p className="text-lg font-extrabold text-brand-700">
              أفلت الملفات هنا
            </p>
            <p className="text-sm text-brand-600 mt-1">
              سيُفتح المودال لاختيار القضية
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          المرفقات
          <Paperclip className="w-5 h-5 text-brand-500" />
        </h2>
        <button
          onClick={quickAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          رفع مرفقات
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi
          title="إجمالي الملفات"
          value={String(allAttachments.length)}
          icon={Files}
          color="bg-brand-500"
        />
        <Kpi
          title="مستندات PDF"
          value={String(pdfCount)}
          icon={FileText}
          color="bg-rose-500"
        />
        <Kpi
          title="صور"
          value={String(imageCount)}
          icon={ImageIcon}
          color="bg-violet-500"
        />
        <Kpi
          title="المساحة"
          value={fmtSize(totalSize)}
          icon={HardDrive}
          color="bg-sky-500"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onReset}
          disabled={!hasFilters}
          className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين
        </button>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {[
            { key: "all", label: "الكل" },
            { key: "pdf", label: "PDF" },
            { key: "image", label: "صور" },
            { key: "doc", label: "مستندات" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setKindFilter(m.key as FileFilter)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                kindFilter === m.key
                  ? "bg-brand-500 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الملف أو القضية..."
            className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="text-xs text-amber-600 text-right">
          النتائج: <bdi dir="ltr">{filtered.length}</bdi> من{" "}
          <bdi dir="ltr">{allAttachments.length}</bdi>
        </div>
      )}

      {/* Drop-zone hint when empty */}
      {allAttachments.length === 0 && !loading && (
        <div className="card p-12 flex flex-col items-center text-center border-2 border-dashed">
          <UploadCloud
            className="w-16 h-16 text-slate-300 mb-3"
            strokeWidth={1.2}
          />
          <h3 className="text-base font-bold text-slate-700">
            لا توجد مرفقات بعد
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            ابدأ بسحب الملفات هنا أو اضغط على «رفع مرفقات» لاختيار قضية
          </p>
          <button
            onClick={quickAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-4 h-4" />
            رفع المرفق الأول
          </button>
          <p className="text-[11px] text-slate-400 mt-3">
            حتى {MAX_FILE_MB} ميجابايت لكل ملف · PDF/DOCX/JPG/PNG/GIF
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="card p-16 text-center text-sm text-slate-400">
          جارٍ التحميل...
        </div>
      ) : filtered.length === 0 && allAttachments.length > 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <AlertCircle className="w-14 h-14 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            لا توجد مرفقات مطابقة للفلاتر
          </h3>
        </div>
      ) : filtered.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((a) => (
            <AttachmentRow
              key={`${a.caseId}-${a.indexInCase}-${a.name}`}
              att={a}
              onOpenCase={() => navigate(`/cases/${a.caseId}`)}
              onDelete={() => handleDelete(a)}
            />
          ))}
        </ul>
      ) : null}

      {openModal && (
        <AttachmentsFormModal
          initialFiles={pendingFiles}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ============================================================
// Components
// ============================================================

function Kpi({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div
        className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-extrabold text-slate-800 mt-0.5">
          <bdi dir="ltr">{value}</bdi>
        </div>
      </div>
    </div>
  );
}

function AttachmentRow({
  att,
  onOpenCase,
  onDelete,
}: {
  att: EnrichedAttachment;
  onOpenCase: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="card p-3 flex items-center gap-3">
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onDelete}
          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
          title="حذف"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <a
          href={att.webViewLink || att.dataUrl || "#"}
          download={att.webViewLink ? undefined : att.name}
          target={att.webViewLink ? "_blank" : undefined}
          rel={att.webViewLink ? "noopener noreferrer" : undefined}
          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md"
          title={att.webViewLink ? "فتح في Drive" : "تحميل"}
        >
          <Download className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={onOpenCase}
          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
          title="فتح القضية"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-w-0 text-right">
        <div className="text-sm font-bold text-slate-800 truncate" title={att.name}>
          {att.name}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-1.5">
          <span>{fmtSize(att.size)}</span>
          <span className="text-slate-300">·</span>
          <Link
            to={`/cases/${att.caseId}`}
            className="text-brand-600 hover:text-brand-700 truncate max-w-[200px]"
          >
            {att.caseTitle}
          </Link>
        </div>
      </div>

      <FileBadge type={att.type} />
    </li>
  );
}

function FileBadge({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return (
      <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-5 h-5 text-violet-600" />
      </div>
    );
  }
  if (type === "application/pdf") {
    return (
      <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-5 h-5 text-brand-600" />
    </div>
  );
}

