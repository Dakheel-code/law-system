import { useMemo, useRef, useState } from "react";
import {
  X,
  Save,
  UploadCloud,
  Briefcase,
  Search,
  Check,
  FileText,
  Image as ImageIcon,
  FileType,
  Loader2,
  Trash2,
} from "lucide-react";
import { Field } from "../ui/Field";
import {
  useCases,
  addAttachmentsToCase,
  type CaseRecord,
  type CaseAttachment,
} from "../../lib/caseStore";

type Props = {
  initialCaseId?: string;
  lockCase?: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

const MAX_FILE_MB = 10;

const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

const fmtSize = (n: number) => {
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function AttachmentsFormModal({
  initialCaseId,
  lockCase = false,
  onClose,
  onSaved,
}: Props) {
  const { cases } = useCases();
  const [caseId, setCaseId] = useState<string>(initialCaseId ?? "");
  const [caseSearch, setCaseSearch] = useState("");
  const [caseListOpen, setCaseListOpen] = useState(!initialCaseId);
  const [staged, setStaged] = useState<CaseAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === caseId) ?? null,
    [cases, caseId]
  );

  const filtered = useMemo(() => {
    const q = caseSearch.trim().toLowerCase();
    if (!q) return cases.slice(0, 12);
    return cases
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          (c.caseNumber ?? "").toLowerCase().includes(q) ||
          (c.requestTitle ?? "").toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [cases, caseSearch]);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const accepted: CaseAttachment[] = [];
    for (const f of arr) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`${f.name} — يتجاوز ${MAX_FILE_MB} ميجابايت`);
        continue;
      }
      try {
        const dataUrl = await readAsDataURL(f);
        accepted.push({ name: f.name, size: f.size, type: f.type, dataUrl });
      } catch {
        // skip
      }
    }
    if (accepted.length > 0) setStaged((p) => [...p, ...accepted]);
  };

  const removeStaged = (i: number) =>
    setStaged((p) => p.filter((_, j) => j !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!caseId) return setError("اختر القضية أولاً");
    if (staged.length === 0)
      return setError("أضف ملفاً واحداً على الأقل");
    setSaving(true);
    const ok = await addAttachmentsToCase(caseId, staged);
    setSaving(false);
    if (ok) {
      onSaved?.();
      onClose();
    }
  };

  // Drag-drop handlers (on the outer drop zone)
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-800">
              إضافة مرفقات
            </h2>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Case selector */}
            <Field label="القضية *">
              {selectedCase && !caseListOpen ? (
                <CaseChip
                  caseItem={selectedCase}
                  locked={lockCase}
                  onClear={() => {
                    setCaseId("");
                    setCaseListOpen(true);
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={caseSearch}
                      onChange={(e) => setCaseSearch(e.target.value)}
                      placeholder="ابحث بكود/رقم/عنوان القضية..."
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                      autoFocus={!initialCaseId}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                    {filtered.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6">
                        لا توجد قضايا مطابقة
                      </div>
                    ) : (
                      filtered.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            setCaseId(c.id);
                            setCaseListOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-right hover:bg-brand-50/40 border-b border-slate-100 last:border-b-0 transition"
                        >
                          <Briefcase className="w-4 h-4 text-brand-500 shrink-0" />
                          <div className="flex-1 min-w-0 text-right">
                            <div className="text-sm font-bold text-slate-700 truncate">
                              {c.requestTitle || c.code}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5" dir="ltr">
                              {c.caseNumber ? `${c.caseNumber} · ${c.code}` : c.code}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Field>

            {/* Drop zone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
                الملفات *
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center transition ${
                  dragOver
                    ? "border-brand-500 bg-brand-50 text-brand-700 scale-[1.01]"
                    : "border-slate-200 text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600"
                }`}
              >
                <UploadCloud className="w-12 h-12 mb-2" strokeWidth={1.4} />
                <span className="text-sm font-bold">
                  {dragOver
                    ? "أفلت الملفات هنا"
                    : "اسحب الملفات هنا أو اضغط للاختيار"}
                </span>
                <span className="text-xs mt-1">
                  PDF, DOCX, JPG, PNG, GIF — حتى {MAX_FILE_MB} ميجابايت لكل ملف
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              {/* Staged files */}
              {staged.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {staged.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <button
                        type="button"
                        onClick={() => removeStaged(i)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md shrink-0"
                        title="إزالة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-sm text-slate-700 truncate" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {fmtSize(f.size)}
                        </div>
                      </div>
                      <FileBadge type={f.type} />
                    </li>
                  ))}
                </ul>
              )}
              {staged.length > 0 && (
                <div className="mt-2 text-xs text-slate-500 text-left">
                  {staged.length} ملف جاهز للرفع
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving || staged.length === 0 || !caseId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving
                ? "جارٍ الرفع..."
                : staged.length > 0
                ? `رفع ${staged.length} ملف`
                : "رفع"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CaseChip({
  caseItem,
  locked,
  onClear,
}: {
  caseItem: CaseRecord;
  locked: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
      {!locked && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-md hover:bg-emerald-100 text-emerald-700"
          title="تغيير القضية"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <Briefcase className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="text-sm font-bold text-emerald-800 flex items-center justify-start gap-1.5">
          <Check className="w-3.5 h-3.5" />
          {caseItem.requestTitle || caseItem.code}
        </div>
        <div className="text-[11px] text-emerald-700/80 mt-0.5 font-mono" dir="ltr">
          {caseItem.caseNumber
            ? `${caseItem.caseNumber} · ${caseItem.code}`
            : caseItem.code}
        </div>
      </div>
    </div>
  );
}

function FileBadge({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return (
      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <ImageIcon className="w-4 h-4 text-violet-600" />
      </div>
    );
  }
  if (type === "application/pdf") {
    return (
      <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
      <FileType className="w-4 h-4 text-brand-600" />
    </div>
  );
}
