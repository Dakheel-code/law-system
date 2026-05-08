import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, UploadCloud, FileText, X } from "lucide-react";
import Stepper, { type Step } from "../../components/cases/Stepper";
import StepNav from "../../components/cases/StepNav";
import StepHeader from "../../components/cases/StepHeader";
import { Field, Input, Textarea } from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import MoneyInput from "../../components/ui/MoneyInput";
import {
  consultationCategories,
  consultationChannels,
} from "../../config/consultationConfig";
import { paymentMethods, paymentStatus, urgencyLevels } from "../../config/caseConfig";

const steps: Step[] = [
  { title: "معلومات العميل", description: "بيانات صاحب الاستشارة" },
  { title: "تفاصيل الاستشارة", description: "الموضوع والتصنيف" },
  { title: "المعلومات المالية", description: "الرسوم والدفع" },
  { title: "المرفقات والملاحظات", description: "إتمام الاستشارة" },
];

type FormState = {
  clientName: string;
  idNumber: string;
  phone: string;
  email: string;
  category: string;
  channel: string;
  urgency: string;
  subject: string;
  description: string;
  fee: number;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
};

const initial: FormState = {
  clientName: "",
  idNumber: "",
  phone: "",
  email: "",
  category: "",
  channel: "in-person",
  urgency: "normal",
  subject: "",
  description: "",
  fee: 0,
  paymentStatus: "unpaid",
  paymentMethod: "",
  notes: "",
};

export default function NewConsultation() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [files, setFiles] = useState<File[]>([]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const submit = () => {
    console.log("Consultation:", data, files);
    alert("تم إنشاء الاستشارة بنجاح ✓");
    navigate("/consultations");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="card p-6 space-y-6 order-2 lg:order-1">
        {current === 0 && (
          <div className="space-y-6">
            <StepHeader
              title="معلومات العميل"
              subtitle="ابحث عن العميل أو أدخل بياناته يدوياً"
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
                البحث عن عميل
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setData(initial)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح البيانات
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600">
                  <Search className="w-4 h-4" />
                  بحث
                </button>
                <input
                  placeholder="الاسم، الهاتف، البريد، أو رقم الهوية"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="اسم العميل *">
                <Input
                  placeholder="الاسم الكامل"
                  value={data.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                />
              </Field>
              <Field label="رقم الهوية">
                <Input
                  placeholder="رقم الهوية"
                  value={data.idNumber}
                  onChange={(e) => update("idNumber", e.target.value)}
                />
              </Field>
              <Field label="رقم الجوال">
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
          </div>
        )}

        {current === 1 && (
          <div className="space-y-6">
            <StepHeader
              title="تفاصيل الاستشارة"
              subtitle="موضوع الاستشارة والتصنيف"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="تصنيف الاستشارة *">
                <Select
                  options={consultationCategories}
                  value={data.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="اختر التصنيف..."
                />
              </Field>
              <Field label="قناة الاستشارة">
                <Select
                  options={consultationChannels}
                  value={data.channel}
                  onChange={(e) => update("channel", e.target.value)}
                />
              </Field>
              <Field label="درجة الاستعجال">
                <Select
                  options={urgencyLevels}
                  value={data.urgency}
                  onChange={(e) => update("urgency", e.target.value)}
                />
              </Field>
              <Field label="موضوع الاستشارة *">
                <Input
                  placeholder="عنوان مختصر"
                  value={data.subject}
                  onChange={(e) => update("subject", e.target.value)}
                />
              </Field>
            </div>
            <Field label="وصف تفصيلي">
              <Textarea
                placeholder="اشرح الاستشارة بالتفصيل..."
                rows={5}
                value={data.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </div>
        )}

        {current === 2 && (
          <div className="space-y-6">
            <StepHeader
              title="المعلومات المالية"
              subtitle="الرسوم وحالة الدفع"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="رسوم الاستشارة">
                <MoneyInput
                  value={data.fee || ""}
                  onChange={(e) => update("fee", parseFloat(e.target.value) || 0)}
                />
              </Field>
              <Field label="حالة الدفع *">
                <Select
                  options={paymentStatus}
                  value={data.paymentStatus}
                  onChange={(e) => update("paymentStatus", e.target.value)}
                />
              </Field>
              <Field label="طريقة الدفع">
                <Select
                  options={paymentMethods}
                  value={data.paymentMethod}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  placeholder="اختر طريقة الدفع..."
                />
              </Field>
            </div>
          </div>
        )}

        {current === 3 && (
          <div className="space-y-6">
            <StepHeader
              title="المرفقات والملاحظات"
              subtitle="ارفع المستندات وأكمل الاستشارة"
            />
            <FileUploadArea files={files} setFiles={setFiles} />
            <Field label="ملاحظات نهائية">
              <Textarea
                placeholder="أي ملاحظات إضافية..."
                rows={5}
                value={data.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </div>
        )}

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

      <aside className="card p-4 sticky top-24 order-1 lg:order-2">
        <Stepper steps={steps} current={current} onJump={setCurrent} />
      </aside>
    </div>
  );
}

function FileUploadArea({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: (f: File[]) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
        المرفقات
      </label>
      <label className="block w-full border-2 border-dashed border-slate-200 rounded-xl py-10 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition cursor-pointer">
        <UploadCloud className="w-10 h-10 mb-3" strokeWidth={1.4} />
        <span className="text-sm font-bold">اضغط لرفع الملفات</span>
        <span className="text-xs mt-1">PDF, DOCX, JPG, PNG — حتى 10MB</span>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          className="hidden"
          onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-700">{f.name}</span>
                <FileText className="w-4 h-4 text-brand-500" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
