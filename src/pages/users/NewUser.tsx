import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Edit3, UserPlus } from "lucide-react";
import AvatarUpload from "../../components/users/AvatarUpload";
import { Field, Input } from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import Toggle from "../../components/ui/Toggle";
import FileUpload from "../../components/ui/FileUpload";
import { userTypes } from "../../config/userConfig";
import { addUser, generateUserCode, getUser, updateUser } from "../../lib/userStore";

export default function NewUser() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);

  const generatedCode = useMemo(generateUserCode, []);
  const [userCode, setUserCode] = useState(generatedCode);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
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
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load existing user data in edit mode
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      const u = await getUser(editId);
      if (cancelled) return;
      if (!u) {
        setNotFound(true);
        return;
      }
      setUserCode(u.code);
      setAvatar(u.avatarDataUrl);
      setData({
        type: u.type,
        name: u.fullName,
        firstName: u.firstName,
        middleName: u.middleName,
        thirdName: u.thirdName,
        lastName: u.lastName,
        idNumber: u.idNumber,
        nationality: u.nationality,
        phone: u.phone,
        email: u.email,
        linkExisting: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const update = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!data.type) return setError("اختر نوع المستخدم");
    if (!data.name.trim()) return setError("أدخل اسم المستخدم");
    if (!data.lastName.trim()) return setError("أدخل الاسم الأخير");

    const payload = {
      type: data.type,
      fullName: data.name,
      firstName: data.firstName,
      middleName: data.middleName,
      thirdName: data.thirdName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      idNumber: data.idNumber,
      nationality: data.nationality,
      avatarDataUrl: avatar,
    };

    setSaving(true);
    if (isEditMode && editId) {
      const ok = await updateUser(editId, payload);
      setSaving(false);
      if (ok) navigate("/users");
    } else {
      const created = await addUser({ code: userCode, ...payload });
      setSaving(false);
      if (created) navigate("/users");
    }
  };

  if (notFound) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-bold text-slate-700">المستخدم غير موجود</h2>
        <p className="text-sm text-slate-500 mt-1">
          ربما تم حذفه أو الرابط غير صحيح.
        </p>
        <button
          onClick={() => navigate("/users")}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-end">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          {isEditMode ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          {isEditMode ? (
            <Edit3 className="w-5 h-5 text-brand-500" />
          ) : (
            <UserPlus className="w-5 h-5 text-brand-500" />
          )}
        </h2>
      </div>

      <div className="card p-6 space-y-6">
        <AvatarUpload value={avatar} onChange={setAvatar} />

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
            <Input value={userCode} readOnly className="bg-slate-100 cursor-not-allowed" />
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

        {!isEditMode && (
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
        )}

        <div className="border-t border-dashed border-slate-200 pt-5">
          <FileUpload
            label="مرفق الهوية الوطنية"
            accept="image/jpeg,image/png,application/pdf"
            maxMB={5}
            hint="الأنواع المسموحة: jpg, jpeg, png, pdf. الحد الأقصى: 5 ميجابايت"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow-card hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "جارٍ الحفظ..." : isEditMode ? "حفظ التغييرات" : "حفظ"}
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
