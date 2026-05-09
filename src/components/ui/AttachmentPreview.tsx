import { useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  FileType,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { AttachmentRecord } from "../../lib/clientStore";

type Props = {
  attachments: AttachmentRecord[];
  index: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
};

export default function AttachmentPreview({
  attachments,
  index,
  onClose,
  onChangeIndex,
}: Props) {
  const file = attachments[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, attachments.length]);

  if (!file) return null;

  const total = attachments.length;
  const next = () => total > 1 && onChangeIndex((index + 1) % total);
  const prev = () => total > 1 && onChangeIndex((index - 1 + total) % total);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <div className="text-right min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatSize(file.size)}
                {total > 1 && (
                  <span className="ml-2">· {index + 1} من {total}</span>
                )}
              </p>
            </div>
            <FileBadge type={file.type} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-auto bg-slate-50 relative">
          {/* Pagination arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                title="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                title="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}

          {isImage && (
            <div className="flex items-center justify-center min-h-[400px] p-4">
              <img
                src={file.dataUrl}
                alt={file.name}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow"
              />
            </div>
          )}

          {isPdf && (
            <iframe
              title={file.name}
              src={file.dataUrl}
              className="w-full h-[75vh] border-0 bg-white"
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <FileType className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                لا يمكن معاينة هذا النوع من الملفات
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                المعاينة المباشرة متاحة للصور و PDF فقط. يمكنك تنزيل الملف لفتحه ببرنامج خارجي.
              </p>
              <a
                href={file.dataUrl}
                download={file.name}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
              >
                <Download className="w-4 h-4" />
                تنزيل الملف
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <a
              href={file.dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
              title="فتح في تبويب جديد"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              فتح في تبويب جديد
            </a>
            <a
              href={file.dataUrl}
              download={file.name}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              تنزيل
            </a>
          </div>
          {total > 1 && (
            <div className="text-xs text-slate-500">
              استخدم ← → أو الأسهم للتنقل
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileBadge({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-5 h-5 text-violet-600" />
      </div>
    );
  }
  if (type === "application/pdf") {
    return (
      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-5 h-5 text-brand-600" />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
