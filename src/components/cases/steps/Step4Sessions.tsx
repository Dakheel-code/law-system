import {
  Plus,
  Trash2,
  Gavel,
  MapPin,
  Video,
  Link as LinkIcon,
  Calendar,
  Clock,
  FileText,
  Building2,
} from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import StepHeader from "../StepHeader";
import type {
  CaseFormState,
  CaseSession,
  SessionMode,
} from "../caseFormTypes";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

const newSession = (): CaseSession => ({
  id: "s-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36),
  mode: "in-person",
  date: "",
  time: "",
  court: "",
  location: "",
  link: "",
  details: "",
});

export default function Step4Sessions({ data, update }: Props) {
  const updateSession = (id: string, patch: Partial<CaseSession>) =>
    update(
      "sessions",
      data.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  const addSession = () => update("sessions", [...data.sessions, newSession()]);

  const removeSession = (id: string) => {
    if (!confirm("هل تريد إزالة هذه الجلسة؟")) return;
    update(
      "sessions",
      data.sessions.filter((s) => s.id !== id)
    );
  };

  // Sort by date+time ascending for display
  const sorted = [...data.sessions].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title="جلسات القضية"
        subtitle="أضف جلسات القضية وستظهر تلقائياً في التقويم والمواعيد"
      />

      <div className="border-t border-dashed border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button
            type="button"
            onClick={addSession}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة جلسة
          </button>
          <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-700">
            الجلسات{" "}
            <span className="text-slate-400 font-normal text-sm">
              ({data.sessions.length})
            </span>
            <Gavel className="w-4 h-4 text-brand-500" />
          </h3>
        </div>

        {data.sessions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
            <Gavel
              className="w-10 h-10 text-slate-300 mx-auto mb-2"
              strokeWidth={1.4}
            />
            <p className="text-sm text-slate-500 mb-3">
              لم يتم إضافة أي جلسة بعد
            </p>
            <button
              type="button"
              onClick={addSession}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
            >
              <Plus className="w-4 h-4" />
              إضافة الجلسة الأولى
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((session, i) => (
              <SessionCard
                key={session.id}
                session={session}
                index={i + 1}
                onChange={(patch) => updateSession(session.id, patch)}
                onRemove={() => removeSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 flex items-start gap-2">
        <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-right flex-1 leading-6">
          📌 جلسات القضية تُسجَّل تلقائياً في{" "}
          <strong>مركز المواعيد</strong> و <strong>التقويم</strong> فور حفظ
          القضية.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Single session card
// ============================================================

function SessionCard({
  session,
  index,
  onChange,
  onRemove,
}: {
  session: CaseSession;
  index: number;
  onChange: (patch: Partial<CaseSession>) => void;
  onRemove: () => void;
}) {
  const isOnline = session.mode === "online";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isOnline ? "border-violet-200 bg-violet-50/30" : "border-sky-200 bg-sky-50/30"
      }`}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md"
        >
          <Trash2 className="w-3.5 h-3.5" />
          إزالة
        </button>
        <div className="flex items-center justify-start gap-2 flex-wrap">
          <ModeButton
            label="حضوري"
            icon={MapPin}
            active={!isOnline}
            color="sky"
            onClick={() => onChange({ mode: "in-person" as SessionMode })}
          />
          <ModeButton
            label="أون لاين"
            icon={Video}
            active={isOnline}
            color="violet"
            onClick={() => onChange({ mode: "online" as SessionMode })}
          />
          <span className="text-xs font-bold text-slate-700 mr-1">
            الجلسة {index}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="التاريخ *">
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={session.date}
              onChange={(e) => onChange({ date: e.target.value })}
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
              value={session.time}
              onChange={(e) => onChange({ time: e.target.value })}
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
              value={session.court}
              onChange={(e) => onChange({ court: e.target.value })}
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
                value={session.link}
                onChange={(e) => onChange({ link: e.target.value })}
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
                value={session.location}
                onChange={(e) => onChange({ location: e.target.value })}
                className="pr-10"
              />
            </div>
          </Field>
        )}
      </div>

      <div className="mt-3">
        <Field label="تفاصيل الجلسة">
          <div className="relative">
            <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <Textarea
              placeholder="أي تفاصيل حول الجلسة (الإجراء المتوقع، الوثائق المطلوبة...)"
              rows={2}
              value={session.details}
              onChange={(e) => onChange({ details: e.target.value })}
              className="pr-10"
            />
          </div>
        </Field>
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
