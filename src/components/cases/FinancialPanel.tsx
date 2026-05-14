// FinancialPanel — interactive financial section for a single case.
//
// Shows totals (fees, paid, remaining) as cards, an editable fees block,
// and a payments list with add / delete actions. All persistence goes
// through caseStore helpers; the parent CaseDetail page re-fetches on
// each mutation.

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Coins,
  Plus,
  Trash2,
  Save,
  Edit3,
  X,
  Calendar,
  StickyNote,
} from "lucide-react";
import {
  addCasePayment,
  removeCasePayment,
  updateCaseFees,
  type CaseRecord,
  type CasePayment,
} from "../../lib/caseStore";
import { Field, Input, Textarea } from "../ui/Field";

const paymentMethodOptions: { value: string; label: string }[] = [
  { value: "cash", label: "نقدًا" },
  { value: "bank-transfer", label: "حوالة بنكية" },
  { value: "cheque", label: "شيك" },
  { value: "card", label: "بطاقة" },
  { value: "other", label: "أخرى" },
];

const methodLabel = (v: string) =>
  paymentMethodOptions.find((o) => o.value === v)?.label || v || "—";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0 }) + " ر.س";

const fmtDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

type Props = {
  caseData: CaseRecord;
  onChanged: () => void;
};

export default function FinancialPanel({ caseData, onChanged }: Props) {
  const totalFees =
    (caseData.estimatedFees || 0) +
    (caseData.consultationFees || 0) +
    (caseData.expectedCourtFees || 0);
  const totalPaid = (caseData.payments ?? []).reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );
  const remaining = Math.max(0, totalFees - totalPaid);
  const paidPct = totalFees > 0 ? Math.min(100, (totalPaid / totalFees) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Totals strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TotalCard
          icon={TrendingUp}
          label="إجمالي الأتعاب"
          value={fmtMoney(totalFees)}
          tone="sky"
        />
        <TotalCard
          icon={Coins}
          label="المدفوع"
          value={fmtMoney(totalPaid)}
          tone="emerald"
        />
        <TotalCard
          icon={CreditCard}
          label="المتبقي"
          value={fmtMoney(remaining)}
          tone={remaining === 0 && totalFees > 0 ? "emerald" : "amber"}
        />
      </div>

      {/* Progress bar */}
      {totalFees > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold text-slate-700">{paidPct.toFixed(0)}%</span>
            <span className="text-slate-500">نسبة السداد</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                paidPct >= 100
                  ? "bg-emerald-500"
                  : paidPct >= 50
                  ? "bg-sky-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Fees breakdown — editable */}
      <FeesBlock caseData={caseData} onChanged={onChanged} />

      {/* Payments list + add */}
      <PaymentsBlock caseData={caseData} onChanged={onChanged} />
    </div>
  );
}

// ============================================================
// Totals
// ============================================================

const totalTints = {
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-100",
    icBg: "bg-sky-100",
    icColor: "text-sky-700",
    text: "text-sky-900",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icBg: "bg-emerald-100",
    icColor: "text-emerald-700",
    text: "text-emerald-900",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icBg: "bg-amber-100",
    icColor: "text-amber-700",
    text: "text-amber-900",
  },
} as const;

function TotalCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: keyof typeof totalTints;
}) {
  const t = totalTints[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-4 flex items-center gap-3`}>
      <div
        className={`w-11 h-11 rounded-xl ${t.icBg} ${t.icColor} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-[11px] text-slate-500 font-bold">{label}</div>
        <div className={`text-base font-extrabold ${t.text} truncate`} dir="ltr">
          {value}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Fees — display + inline edit
// ============================================================

function FeesBlock({
  caseData,
  onChanged,
}: {
  caseData: CaseRecord;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [est, setEst] = useState(caseData.estimatedFees ?? 0);
  const [cons, setCons] = useState(caseData.consultationFees ?? 0);
  const [court, setCourt] = useState(caseData.expectedCourtFees ?? 0);
  const [notes, setNotes] = useState(caseData.feesNotes ?? "");

  const reset = () => {
    setEst(caseData.estimatedFees ?? 0);
    setCons(caseData.consultationFees ?? 0);
    setCourt(caseData.expectedCourtFees ?? 0);
    setNotes(caseData.feesNotes ?? "");
  };

  const save = async () => {
    setSaving(true);
    const ok = await updateCaseFees(caseData.id, {
      estimatedFees: est || 0,
      consultationFees: cons || 0,
      expectedCourtFees: court || 0,
      feesNotes: notes,
    });
    setSaving(false);
    if (ok) {
      onChanged();
      setEditing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-md text-xs font-bold shadow hover:bg-brand-600 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
            <button
              onClick={() => {
                reset();
                setEditing(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-bold hover:bg-slate-50"
            >
              <X className="w-3.5 h-3.5" />
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-100"
          >
            <Edit3 className="w-3.5 h-3.5" />
            تعديل الأتعاب
          </button>
        )}
        <h4 className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-500" />
          تفصيل الأتعاب
        </h4>
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="التكلفة المقدّرة">
            <Input
              type="number"
              min={0}
              step="any"
              value={est || ""}
              onChange={(e) => setEst(Number(e.target.value) || 0)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="رسوم الاستشارة">
            <Input
              type="number"
              min={0}
              step="any"
              value={cons || ""}
              onChange={(e) => setCons(Number(e.target.value) || 0)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <Field label="الرسوم القضائية المتوقعة">
            <Input
              type="number"
              min={0}
              step="any"
              value={court || ""}
              onChange={(e) => setCourt(Number(e.target.value) || 0)}
              dir="ltr"
              className="text-left"
            />
          </Field>
          <div className="md:col-span-3">
            <Field label="ملاحظات الأتعاب">
              <Textarea
                rows={2}
                placeholder="أي ملاحظات حول الأتعاب..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <FeeCell
            label="التكلفة المقدّرة"
            value={caseData.estimatedFees || 0}
          />
          <FeeCell
            label="رسوم الاستشارة"
            value={caseData.consultationFees || 0}
          />
          <FeeCell
            label="الرسوم القضائية"
            value={caseData.expectedCourtFees || 0}
          />
          {caseData.feesNotes && (
            <div className="md:col-span-3 flex items-start gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-right">
              <StickyNote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-6 whitespace-pre-line flex-1">
                {caseData.feesNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeeCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-right">
      <div className="text-[10px] text-slate-500 font-bold mb-0.5">{label}</div>
      <div className="text-sm font-extrabold text-slate-800" dir="ltr">
        {value > 0 ? fmtMoney(value) : "—"}
      </div>
    </div>
  );
}

// ============================================================
// Payments — list + add
// ============================================================

function PaymentsBlock({
  caseData,
  onChanged,
}: {
  caseData: CaseRecord;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);

  const payments = [...(caseData.payments ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const handleDelete = async (p: CasePayment) => {
    if (!confirm(`حذف دفعة ${fmtMoney(p.amount)} بتاريخ ${fmtDate(p.date)}؟`))
      return;
    const ok = await removeCasePayment(caseData.id, p.id);
    if (ok) onChanged();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-md text-xs font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة دفعة
          </button>
        )}
        <h4 className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-500" />
          الدفعات ({payments.length})
        </h4>
      </div>

      {adding && (
        <AddPaymentForm
          caseId={caseData.id}
          onCancel={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            onChanged();
          }}
        />
      )}

      {payments.length === 0 ? (
        <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-lg">
          لم تُسجَّل أي دفعات بعد
        </div>
      ) : (
        <ul className="space-y-2">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition"
            >
              <button
                onClick={() => handleDelete(p)}
                title="حذف الدفعة"
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(p.date)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700">
                    {methodLabel(p.method)}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700" dir="ltr">
                    {fmtMoney(p.amount)}
                  </span>
                </div>
                {p.notes && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {p.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPaymentForm({
  caseId,
  onCancel,
  onAdded,
}: {
  caseId: string;
  onCancel: () => void;
  onAdded: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("bank-transfer");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("أدخل مبلغاً صحيحاً أكبر من صفر");
      return;
    }
    if (!date) {
      setError("أدخل تاريخ الدفعة");
      return;
    }
    setError(null);
    setSaving(true);
    const ok = await addCasePayment(caseId, {
      amount: amt,
      date,
      method,
      notes,
    });
    setSaving(false);
    if (ok) onAdded();
    else setError("تعذّر حفظ الدفعة، حاول مرة أخرى");
  };

  return (
    <div className="mb-4 p-3 bg-brand-50/50 border border-brand-200 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <Field label="المبلغ (ر.س) *">
          <Input
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            dir="ltr"
            className="text-left"
            autoFocus
          />
        </Field>
        <Field label="التاريخ *">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="طريقة الدفع">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 text-right"
          >
            {paymentMethodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-3">
          <Field label="ملاحظات">
            <Textarea
              rows={2}
              placeholder="رقم الإيصال، مرجع الحوالة، أو أي تفاصيل أخرى..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
      </div>
      {error && (
        <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 text-right">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-bold hover:bg-slate-50"
        >
          إلغاء
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-md text-xs font-bold shadow hover:bg-brand-600 disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "جارٍ الحفظ..." : "حفظ الدفعة"}
        </button>
      </div>
    </div>
  );
}
