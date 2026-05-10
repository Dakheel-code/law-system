import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Info,
  Edit3,
  UserCog,
  UserCheck,
  User,
  Briefcase,
  Landmark,
  X,
} from "lucide-react";
import HStepper, { type HStep } from "../../components/contracts/HStepper";
import StepNav from "../../components/cases/StepNav";
import { Field, Input, Textarea } from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import MoneyInput from "../../components/ui/MoneyInput";
import { contractTypes, taxRates } from "../../config/consultationConfig";
import { priorities } from "../../config/caseConfig";
import { addContract } from "../../lib/contractStore";

const steps: HStep[] = [
  { title: "بيانات العميل" },
  { title: "تفاصيل العقد" },
  { title: "بنود الخدمات" },
  { title: "الخصومات والضريبة" },
  { title: "جدول المدفوعات" },
  { title: "المراجعة والحفظ" },
];

const sourceOptions = [
  { value: "manual", label: "إدخال يدوي", icon: Edit3 },
  { value: "user", label: "مستخدم مسجل", icon: UserCog },
  { value: "client", label: "عميل مسجل", icon: UserCheck },
];

const clientTypeOptions = [
  { value: "individual", label: "فرد", icon: User },
  { value: "private", label: "قطاع خاص", icon: Briefcase },
  { value: "government", label: "جهة حكومية", icon: Landmark },
];

type Service = { id: string; name: string; qty: number; price: number };
type Installment = { id: string; date: string; amount: number; note: string };

type FormState = {
  source: string;
  search: string;
  clientType: string;
  fullName: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;

  contractTitle: string;
  contractType: string;
  startDate: string;
  endDate: string;
  priority: string;
  description: string;

  services: Service[];

  discount: number;
  discountPercent: number;
  taxRate: string;

  installments: Installment[];

  notes: string;
};

const initial: FormState = {
  source: "manual",
  search: "",
  clientType: "individual",
  fullName: "",
  idNumber: "",
  phone: "",
  email: "",
  address: "",
  contractTitle: "",
  contractType: "",
  startDate: "",
  endDate: "",
  priority: "medium",
  description: "",
  services: [{ id: "1", name: "", qty: 1, price: 0 }],
  discount: 0,
  discountPercent: 0,
  taxRate: "15",
  installments: [],
  notes: "",
};

export default function NewContract() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<FormState>(initial);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const submit = async () => {
    const created = await addContract(data);
    if (created) navigate("/contracts");
  };

  const subtotal = data.services.reduce((sum, s) => sum + s.qty * s.price, 0);
  const discountAmount = data.discount + (subtotal * data.discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = (taxableAmount * parseFloat(data.taxRate || "0")) / 100;
  const total = taxableAmount + tax;

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          إنشاء عقد جديد
          <Plus className="w-5 h-5 text-brand-500" />
        </h2>
        <Link
          to="/contracts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
        >
          <X className="w-4 h-4" />
          إلغاء
        </Link>
      </div>

      <HStepper steps={steps} current={current} onJump={setCurrent} />

      <div className="border-t border-slate-100 pt-6">
        {current === 0 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-700 text-right">بيانات العميل</h3>

            <RadioRow
              label="مصدر بيانات العميل"
              options={sourceOptions}
              value={data.source}
              onChange={(v) => update("source", v)}
            />

            <Field label="البحث عن عميل موجود">
              <Input
                placeholder="الاسم، الهاتف، البريد، أو رقم الهوية..."
                value={data.search}
                onChange={(e) => update("search", e.target.value)}
              />
            </Field>

            <RadioRow
              label="نوع العميل"
              options={clientTypeOptions}
              value={data.clientType}
              onChange={(v) => update("clientType", v)}
            />

            <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-3 flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-violet-500 shrink-0" />
              <span>سيتم إنشاء سجل عميل تلقائياً في قائمة العملاء عند حفظ العقد</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="الاسم الكامل *">
                <Input
                  placeholder="الاسم الكامل"
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </Field>
              <Field label="رقم الهوية">
                <Input
                  placeholder="رقم الهوية"
                  value={data.idNumber}
                  onChange={(e) => update("idNumber", e.target.value)}
                />
              </Field>
              <Field label="الهاتف">
                <Input
                  placeholder="05xxxxxxxx"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
            </div>

            <Field label="العنوان">
              <Textarea
                placeholder="العنوان التفصيلي..."
                rows={3}
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </Field>
          </div>
        )}

        {current === 1 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-700 text-right">تفاصيل العقد</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="عنوان العقد *">
                <Input
                  placeholder="عنوان العقد"
                  value={data.contractTitle}
                  onChange={(e) => update("contractTitle", e.target.value)}
                />
              </Field>
              <Field label="نوع العقد *">
                <Select
                  options={contractTypes}
                  value={data.contractType}
                  onChange={(e) => update("contractType", e.target.value)}
                  placeholder="اختر نوع العقد..."
                />
              </Field>
              <Field label="تاريخ البدء">
                <Input
                  type="date"
                  value={data.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="تاريخ الانتهاء">
                <Input
                  type="date"
                  value={data.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="الأولوية">
                <Select
                  options={priorities}
                  value={data.priority}
                  onChange={(e) => update("priority", e.target.value)}
                />
              </Field>
            </div>
            <Field label="وصف العقد">
              <Textarea
                placeholder="وصف تفصيلي لمحتوى العقد..."
                rows={4}
                value={data.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </div>
        )}

        {current === 2 && (
          <ServicesEditor data={data} update={update} />
        )}

        {current === 3 && (
          <DiscountsTax
            data={data}
            update={update}
            subtotal={subtotal}
            tax={tax}
            total={total}
            discountAmount={discountAmount}
          />
        )}

        {current === 4 && (
          <PaymentSchedule data={data} update={update} totalDue={total} />
        )}

        {current === 5 && (
          <ReviewStep data={data} subtotal={subtotal} tax={tax} total={total} />
        )}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <StepNav
          current={current}
          total={steps.length}
          onPrev={() => setCurrent((c) => Math.max(c - 1, 0))}
          onNext={() => setCurrent((c) => Math.min(c + 1, steps.length - 1))}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}

function RadioRow<T extends { value: string; label: string; icon: React.ComponentType<{ className?: string }> }>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-2 text-right">{label}</label>
      <div className="flex flex-wrap gap-2 justify-end">
        {options.map((opt) => {
          const Icon = opt.icon;
          const checked = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${
                checked
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  checked ? "border-brand-500" : "border-slate-300"
                }`}
              >
                {checked && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </span>
              <span>{opt.label}</span>
              <Icon className={`w-4 h-4 ${checked ? "text-brand-500" : "text-slate-400"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ServicesEditor({
  data,
  update,
}: {
  data: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const setServices = (services: Service[]) => update("services", services);
  const updateRow = (id: string, patch: Partial<Service>) =>
    setServices(data.services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = () =>
    setServices([
      ...data.services,
      { id: crypto.randomUUID(), name: "", qty: 1, price: 0 },
    ]);
  const remove = (id: string) =>
    setServices(data.services.length > 1 ? data.services.filter((s) => s.id !== id) : data.services);

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-700 text-right">بنود الخدمات</h3>
      <div className="space-y-3">
        {data.services.map((s, i) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-1 flex justify-center md:order-1">
              {data.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="text-rose-500 hover:bg-rose-50 p-2 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="md:col-span-3 md:order-2">
              <Field label="المبلغ">
                <MoneyInput
                  value={s.price || ""}
                  onChange={(e) => updateRow(s.id, { price: parseFloat(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <div className="md:col-span-2 md:order-3">
              <Field label="الكمية">
                <Input
                  type="number"
                  min={1}
                  value={s.qty}
                  onChange={(e) => updateRow(s.id, { qty: parseInt(e.target.value) || 1 })}
                  dir="ltr"
                  className="text-center"
                />
              </Field>
            </div>
            <div className="md:col-span-6 md:order-4">
              <Field label={`بند #${i + 1}`}>
                <Input
                  placeholder="اسم الخدمة"
                  value={s.name}
                  onChange={(e) => updateRow(s.id, { name: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
        >
          <Plus className="w-4 h-4" />
          إضافة بند
        </button>
      </div>
    </div>
  );
}

function DiscountsTax({
  data,
  update,
  subtotal,
  discountAmount,
  tax,
  total,
}: {
  data: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-700 text-right">الخصومات والضريبة</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="خصم بنسبة (%)">
          <Input
            type="number"
            min={0}
            max={100}
            value={data.discountPercent || ""}
            onChange={(e) => update("discountPercent", parseFloat(e.target.value) || 0)}
            dir="ltr"
            className="text-left"
            placeholder="0"
          />
        </Field>
        <Field label="خصم بمبلغ ثابت">
          <MoneyInput
            value={data.discount || ""}
            onChange={(e) => update("discount", parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="نسبة الضريبة">
          <Select
            options={taxRates}
            value={data.taxRate}
            onChange={(e) => update("taxRate", e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <Row label="المجموع الفرعي" value={subtotal} />
        <Row label="الخصم" value={-discountAmount} negative />
        <Row label={`الضريبة (${data.taxRate}%)`} value={tax} />
        <div className="border-t border-slate-200 pt-2 mt-2">
          <Row label="الإجمالي" value={total} bold />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  negative,
}: {
  label: string;
  value: number;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span
        className={`${bold ? "text-base font-extrabold text-slate-800" : ""} ${
          negative ? "text-rose-600" : "text-slate-700"
        }`}
        dir="ltr"
      >
        {value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
      </span>
      <span className={`text-slate-500 ${bold ? "font-bold" : ""}`}>{label}</span>
    </div>
  );
}

function PaymentSchedule({
  data,
  update,
  totalDue,
}: {
  data: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  totalDue: number;
}) {
  const setRows = (rows: Installment[]) => update("installments", rows);
  const updateRow = (id: string, patch: Partial<Installment>) =>
    setRows(data.installments.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const add = () =>
    setRows([
      ...data.installments,
      { id: crypto.randomUUID(), date: "", amount: 0, note: "" },
    ]);
  const remove = (id: string) => setRows(data.installments.filter((i) => i.id !== id));

  const allocated = data.installments.reduce((s, i) => s + i.amount, 0);
  const remaining = totalDue - allocated;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100"
        >
          <Plus className="w-4 h-4" />
          إضافة قسط
        </button>
        <h3 className="text-base font-bold text-slate-700 text-right">جدول المدفوعات</h3>
      </div>

      {data.installments.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">
          لا توجد أقساط — أضف قسطاً للبدء
        </div>
      ) : (
        <div className="space-y-3">
          {data.installments.map((i, idx) => (
            <div key={i.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => remove(i.id)}
                  className="text-rose-500 hover:bg-rose-50 p-2 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="md:col-span-3">
                <Field label="المبلغ">
                  <MoneyInput
                    value={i.amount || ""}
                    onChange={(e) => updateRow(i.id, { amount: parseFloat(e.target.value) || 0 })}
                  />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="تاريخ الاستحقاق">
                  <Input
                    type="date"
                    value={i.date}
                    onChange={(e) => updateRow(i.id, { date: e.target.value })}
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
              </div>
              <div className="md:col-span-5">
                <Field label={`القسط #${idx + 1}`}>
                  <Input
                    placeholder="ملاحظة (اختياري)"
                    value={i.note}
                    onChange={(e) => updateRow(i.id, { note: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <Row label="إجمالي العقد" value={totalDue} />
        <Row label="إجمالي الأقساط" value={allocated} />
        <Row label="المتبقي بدون توزيع" value={remaining} bold negative={remaining > 0} />
      </div>
    </div>
  );
}

function ReviewStep({
  data,
  subtotal,
  tax,
  total,
}: {
  data: FormState;
  subtotal: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-700 text-right">المراجعة والحفظ</h3>

      <Section title="بيانات العميل">
        <Pair label="الاسم" value={data.fullName || "—"} />
        <Pair label="رقم الهوية" value={data.idNumber || "—"} />
        <Pair label="الهاتف" value={data.phone || "—"} />
        <Pair label="البريد" value={data.email || "—"} />
      </Section>

      <Section title="تفاصيل العقد">
        <Pair label="العنوان" value={data.contractTitle || "—"} />
        <Pair label="نوع العقد" value={data.contractType || "—"} />
        <Pair label="من → إلى" value={`${data.startDate || "—"} → ${data.endDate || "—"}`} />
      </Section>

      <Section title="ملخص مالي">
        <Pair label="المجموع الفرعي" value={`${subtotal.toFixed(2)} SAR`} />
        <Pair label="الضريبة" value={`${tax.toFixed(2)} SAR`} />
        <Pair label="الإجمالي" value={`${total.toFixed(2)} SAR`} bold />
      </Section>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-bold text-slate-700 mb-3 text-right">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Pair({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={`text-slate-700 ${bold ? "font-extrabold" : ""}`}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}
