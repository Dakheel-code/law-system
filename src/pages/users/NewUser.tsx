import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";
import AvatarUpload from "../../components/users/AvatarUpload";
import { Field, Input } from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import FileUpload from "../../components/ui/FileUpload";
import { userTypes } from "../../config/userConfig";

const userId = "USR-" + Math.floor(10000 + Math.random() * 90000);

export default function NewUser() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    type: "",
    name: "",
    firstName: "",
    middleName: "",
    thirdName: "",
    lastName: "",
    idNumber: "",
    nationality: "",
    phone: "",
    email: "",
    linkExisting: false,
  });

  const update = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New user:", data);
    alert("تم حفظ المستخدم ✓");
    navigate("/users");
  };

  return (
    <form onSubmit={submit} className="card p-6 space-y-6">
      <AvatarUpload />

      <div className="border-t border-dashed border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="نوع المستخدم *">
          <Select
            options={userTypes}
            value={data.type}
            onChange={(e) => update("type", e.target.value)}
            placeholder="اختر نوع المستخدم..."
          />
        </Field>
        <Field label="اسم المستخدم *">
          <Input
            placeholder="أدخل اسم المستخدم"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="رقم المستخدم">
          <Input value={userId} readOnly className="bg-slate-100 cursor-not-allowed" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="الاسم الأول">
          <Input
            placeholder="الاسم الأول"
            value={data.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </Field>
        <Field label="الاسم الثاني">
          <Input
            placeholder="الاسم الثاني"
            value={data.middleName}
            onChange={(e) => update("middleName", e.target.value)}
          />
        </Field>
        <Field label="الاسم الثالث">
          <Input
            placeholder="الاسم الثالث"
            value={data.thirdName}
            onChange={(e) => update("thirdName", e.target.value)}
          />
        </Field>
        <Field label="الاسم الأخير *">
          <Input
            placeholder="الاسم الأخير"
            value={data.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="البريد الإلكتروني">
          <Input
            type="email"
            placeholder="أدخل البريد الإلكتروني"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="رقم الجوال">
          <Input
            placeholder="05XXXXXXXX"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="رقم الهوية">
          <Input
            placeholder="رقم الهوية الوطنية"
            value={data.idNumber}
            onChange={(e) => update("idNumber", e.target.value)}
          />
        </Field>
        <Field label="الجنسية">
          <Input
            placeholder="الجنسية"
            value={data.nationality}
            onChange={(e) => update("nationality", e.target.value)}
          />
        </Field>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5 flex items-start gap-4">
        <Toggle
          checked={data.linkExisting}
          onChange={(v) => update("linkExisting", v)}
        />
        <div className="flex-1 text-right">
          <h4 className="text-sm font-bold text-slate-700">ربط بموظف موجود بدون حساب</h4>
          <p className="text-xs text-slate-500 mt-1">
            إذا كان هذا المستخدم لموظف مسجل مسبقاً بدون حساب، فعّل هذا الخيار واختر الموظف
          </p>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 pt-5">
        <FileUpload
          label="مرفق الهوية الوطنية"
          accept="image/jpeg,image/png,application/pdf"
          maxMB={5}
          hint="الأنواع المسموحة: jpg, jpeg, png, pdf. الحد الأقصى: 5 ميجابايت"
        />
      </div>

      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow-card hover:bg-brand-600"
        >
          <Save className="w-4 h-4" />
          حفظ
        </button>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
        >
          <X className="w-4 h-4" />
          إلغاء
        </button>
      </div>
    </form>
  );
}
