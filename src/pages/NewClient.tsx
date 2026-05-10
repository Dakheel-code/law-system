import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  UserPlus,
  Edit3,
  User,
  Briefcase,
  Building2,
  Landmark,
  Flag,
  Infinity as InfinityIcon,
  FileText,
  CalendarRange,
  Save,
} from "lucide-react";
import RadioGroup from "../components/ui/RadioGroup";
import { Field, Input, Textarea } from "../components/ui/Field";
import Select from "../components/ui/Select";
import AttachmentsUpload from "../components/ui/AttachmentsUpload";
import {
  addClient,
  getClient,
  updateClient,
  type AttachmentRecord,
} from "../lib/clientStore";
import { nationalities } from "../config/nationalities";

const clientTypeOptions = [
  { value: "individual", label: "فرد", icon: User },
  { value: "private", label: "قطاع خاص", icon: Briefcase },
  { value: "institution", label: "مؤسسة", icon: Building2 },
  { value: "government", label: "جهة حكومية", icon: Landmark },
  { value: "semi-government", label: "شبه حكومية", icon: Flag },
];

const contractTypeOptions = [
  { value: "default", label: "افتراضي", icon: InfinityIcon },
  { value: "single", label: "أحادي", icon: FileText },
  { value: "annual", label: "سنوي", icon: CalendarRange },
];

export default function NewClient() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);

  const [clientType, setClientType] = useState("individual");
  const [contractType, setContractType] = useState("default");
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    lastName: "",
    idNumber: "",
    nationality: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (!editId) return;
    const c = getClient(editId);
    if (!c) {
      setNotFound(true);
      return;
    }
    setClientType(c.clientType);
    setContractType(c.contractType);
    setAttachments(c.attachments);
    setForm({
      firstName: c.firstName,
      secondName: c.secondName,
      thirdName: c.thirdName,
      lastName: c.lastName,
      idNumber: c.idNumber,
      nationality: c.nationality,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
    });
  }, [editId]);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() && !form.lastName.trim()) {
      setError("أدخل الاسم الأول أو اسم العائلة على الأقل");
      return;
    }

    const fullName = [form.firstName, form.secondName, form.thirdName, form.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const payload = {
      clientType,
      contractType,
      firstName: form.firstName,
      secondName: form.secondName,
      thirdName: form.thirdName,
      lastName: form.lastName,
      idNumber: form.idNumber,
      nationality: form.nationality,
      email: form.email,
      phone: form.phone,
      attachments,
      notes: form.notes,
    };

    if (isEditMode && editId) {
      updateClient(editId, { ...payload, fullName });
      navigate(`/clients/${editId}`);
    } else {
      addClient(payload);
      navigate("/clients");
    }
  };

  if (notFound) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-bold text-slate-700">العميل غير موجود</h2>
        <p className="text-sm text-slate-500 mt-1">
          ربما تم حذفه أو الرابط غير صحيح.
        </p>
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للعملاء
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-blue-500 via-brand-500 to-emerald-500" />

        <div className="p-6 flex items-center justify-between">
          <Link
            to={isEditMode && editId ? `/clients/${editId}` : "/clients"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <ArrowRight className="w-4 h-4" />
            عودة
          </Link>

          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
            {isEditMode ? "تعديل عميل" : "إضافة عميل جديد"}
            {isEditMode ? (
              <Edit3 className="w-5 h-5 text-brand-500" />
            ) : (
              <UserPlus className="w-5 h-5 text-brand-500" />
            )}
          </h2>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <RadioGroup
            label="نوع العميل"
            options={clientTypeOptions}
            value={clientType}
            onChange={setClientType}
          />
          <RadioGroup
            label="نوع التعاقد"
            options={contractTypeOptions}
            value={contractType}
            onChange={setContractType}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الاسم الأول">
              <Input
                placeholder="الاسم الأول"
                value={form.firstName}
                onChange={update("firstName")}
              />
            </Field>
            <Field label="الاسم الثاني">
              <Input
                placeholder="الاسم الثاني"
                value={form.secondName}
                onChange={update("secondName")}
              />
            </Field>
            <Field label="الاسم الثالث">
              <Input
                placeholder="الاسم الثالث"
                value={form.thirdName}
                onChange={update("thirdName")}
              />
            </Field>
            <Field label="اسم العائلة">
              <Input
                placeholder="اسم العائلة"
                value={form.lastName}
                onChange={update("lastName")}
              />
            </Field>
            <Field label="رقم الهوية">
              <Input
                placeholder="رقم الهوية"
                value={form.idNumber}
                onChange={update("idNumber")}
              />
            </Field>
            <Field label="الجنسية">
              <Select
                options={nationalities}
                value={form.nationality}
                onChange={update("nationality")}
                placeholder="اختر الجنسية..."
              />
            </Field>
            <Field label="البريد الإلكتروني">
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={update("email")}
                dir="ltr"
                className="text-left"
              />
            </Field>
            <Field label="رقم الهاتف">
              <Input
                placeholder="05XXXXXXXX"
                value={form.phone}
                onChange={update("phone")}
                dir="ltr"
                className="text-left"
              />
            </Field>
          </div>

          <AttachmentsUpload
            label="مرفقات العميل"
            value={attachments}
            onChange={setAttachments}
          />

          <Field label="ملاحظات">
            <Textarea
              placeholder="ملاحظات عن العميل..."
              value={form.notes}
              onChange={update("notes")}
            />
          </Field>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow-card hover:bg-brand-600"
        >
          <Save className="w-4 h-4" />
          {isEditMode ? "حفظ التغييرات" : "حفظ"}
        </button>
        <Link
          to={isEditMode && editId ? `/clients/${editId}` : "/clients"}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
        >
          إلغاء
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </form>
  );
}
