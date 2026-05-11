import { useEffect, useMemo, useState } from "react";
import {
  X,
  Save,
  MapPin,
  Video,
  Link as LinkIcon,
  Calendar,
  Clock,
  FileText,
  Building2,
  Briefcase,
  Search,
  Check,
} from "lucide-react";
import { Field, Input, Textarea } from "../ui/Field";
import {
  useCases,
  addSession,
  updateSessionOnCase,
  type CaseRecord,
  type CaseSession,
} from "../../lib/caseStore";

type Props = {
  // When set, modal is in edit mode for that session
  initialCaseId?: string;
  initialSession?: CaseSession;
  // Lock the case selector (e.g. when launched from case detail)
  lockCase?: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

const newSessionId = () =>
  "s-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36);

export default function SessionFormModal({
  initialCaseId,
  initialSession,
  lockCase = false,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(initialSession);
  const { cases } = useCases();
  const [caseId, setCaseId] = useState<string>(initialCaseId ?? "");
  const [caseSearch, setCaseSearch] = useState("");
  const [caseListOpen, setCaseListOpen] = useState(!initialCaseId);
  const [mode, setMode] = useState<"in-person" | "online">(
    initialSession?.mode ?? "in-person"
  );
  const [date, setDate] = useState(initialSession?.date ?? "");
  const [time, setTime] = useState(initialSession?.time ?? "");
  const [court, setCourt] = useState(initialSession?.court ?? "");
  const [location, setLocation] = useState(initialSession?.location ?? "");
  const [link, setLink] = useState(initialSession?.link ?? "");
  const [details, setDetails] = useState(initialSession?.details ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCaseId) return;
    setCaseId(initialCaseId);
    setCaseListOpen(false);
  }, [initialCaseId]);

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

  const isOnline = mode === "online";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!caseId) return setError("اختر القضية أولاً");
    if (!date) return setError("أدخل تاريخ الجلسة");
    if (!time) return setError("أدخل وقت الجلسة");

    const session: CaseSession = {
      id: initialSession?.id ?? newSessionId(),
      mode,
      date,
      time,
      court,
      location,
      link,
      details,
    };
    setSaving(true);
    const ok = isEdit
      ? await updateSessionOnCase(caseId, session.id, session)
      : await addSession(caseId, session);
    setSaving(false);
    if (ok) {
      onSaved?.();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
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
              {isEdit ? "تعديل جلسة" : "إضافة جلسة جديدة"}
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

            {/* Mode + date + time */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
                نوع الجلسة
              </label>
              <div className="flex items-center justify-start gap-2">
                <ModeButton
                  label="حضوري"
                  icon={MapPin}
                  active={!isOnline}
                  color="sky"
                  onClick={() => setMode("in-person")}
                />
                <ModeButton
                  label="أون لاين"
                  icon={Video}
                  active={isOnline}
                  color="violet"
                  onClick={() => setMode("online")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="التاريخ *">
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    dir="ltr"
                    className="text-left pr-10"
                  />
                </div>
              </Field>
              <Field label="الساعة *">
                <div className="relative">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    dir="ltr"
                    className="text-left pr-10"
                  />
                </div>
              </Field>

              <Field label="المحكمة">
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="مثال: المحكمة العامة بالرياض"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </Field>

              {isOnline ? (
                <Field label="رابط الجلسة">
                  <div className="relative">
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="https://meet.google.com/..."
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      dir="ltr"
                      className="text-left pr-10"
                    />
                  </div>
                </Field>
              ) : (
                <Field label="المكان">
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="القاعة، الدور، الباب..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </Field>
              )}
            </div>

            <Field label="تفاصيل الجلسة">
              <div className="relative">
                <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <Textarea
                  placeholder="أي تفاصيل حول الجلسة..."
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="pr-10"
                />
              </div>
            </Field>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الجلسة"}
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

function ModeButton({
  label,
  icon: Icon,
  active,
  color,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  color: "sky" | "violet";
  onClick: () => void;
}) {
  const activeCls =
    color === "sky"
      ? "bg-sky-500 text-white border-sky-500"
      : "bg-violet-500 text-white border-violet-500";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition ${
        active
          ? activeCls
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
