import { useState } from "react";
import {
  Building2,
  Settings,
  Bell,
  Database,
  Activity,
  Save,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Languages,
  Clock,
  DollarSign,
  Calendar,
  Download,
  Upload,
  Shield,
} from "lucide-react";
import { Field, Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import Toggle from "../components/ui/Toggle";

const tabs = [
  { key: "office", label: "بيانات المكتب", icon: Building },
  { key: "general", label: "الإعدادات العامة", icon: Settings },
  { key: "notifications", label: "الإشعارات", icon: Bell },
  { key: "backup", label: "النسخ الاحتياطي", icon: Database },
  { key: "activity", label: "سجل النشاطات", icon: Activity },
];

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];
const timezones = [
  { value: "asia-riyadh", label: "الرياض (GMT+3)" },
  { value: "asia-dubai", label: "دبي (GMT+4)" },
  { value: "africa-cairo", label: "القاهرة (GMT+2)" },
];
const currencies = [
  { value: "sar", label: "ريال سعودي (SAR)" },
  { value: "usd", label: "دولار أمريكي (USD)" },
  { value: "aed", label: "درهم إماراتي (AED)" },
];
const calendars = [
  { value: "both", label: "هجري وميلادي" },
  { value: "hijri", label: "هجري فقط" },
  { value: "gregorian", label: "ميلادي فقط" },
];
const dateFormats = [
  { value: "dmy", label: "يوم/شهر/سنة (10/05/2026)" },
  { value: "ymd", label: "سنة/شهر/يوم (2026/05/10)" },
  { value: "mdy", label: "شهر/يوم/سنة (05/10/2026)" },
];

export default function Admin() {
  const [tab, setTab] = useState("office");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          الإدارة
          <Building2 className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="card">
        <div className="border-b border-slate-200 flex justify-end overflow-x-auto">
          <div className="flex">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm transition relative whitespace-nowrap ${
                    active
                      ? "text-brand-700 font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span>{t.label}</span>
                  <Icon className="w-4 h-4" />
                  {active && (
                    <span className="absolute -bottom-px right-0 left-0 h-0.5 bg-brand-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {tab === "office" && <OfficeSection />}
          {tab === "general" && <GeneralSection />}
          {tab === "notifications" && <NotificationsSection />}
          {tab === "backup" && <BackupSection />}
          {tab === "activity" && <ActivitySection />}
        </div>
      </div>

      {tab !== "activity" && (
        <div className="flex justify-start">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      )}
    </div>
  );
}

function OfficeSection() {
  const [form, setForm] = useState({
    name: "شركة ناصر طريد للمحاماة",
    shortName: "ناصر طريد",
    phone: "",
    email: "",
    website: "",
    address: "",
    cr: "",
    tax: "",
  });
  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="اسم المكتب الكامل">
          <div className="relative">
            <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="pr-10"
            />
          </div>
        </Field>
        <Field label="الاسم المختصر (يظهر في الشريط الجانبي)">
          <Input value={form.shortName} onChange={(e) => update("shortName", e.target.value)} />
        </Field>
        <Field label="رقم الجوال / الهاتف">
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+966 5X XXX XXXX"
              dir="ltr"
              className="text-left pr-10"
            />
          </div>
        </Field>
        <Field label="البريد الإلكتروني">
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="info@nasser-tareed.com"
              dir="ltr"
              className="text-left pr-10"
              type="email"
            />
          </div>
        </Field>
        <Field label="الموقع الإلكتروني">
          <div className="relative">
            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
              className="text-left pr-10"
            />
          </div>
        </Field>
        <Field label="العنوان الفعلي">
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="pr-10"
              placeholder="الرياض، المملكة العربية السعودية"
            />
          </div>
        </Field>
        <Field label="رقم السجل التجاري">
          <div className="relative">
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={form.cr}
              onChange={(e) => update("cr", e.target.value)}
              dir="ltr"
              className="text-left pr-10"
              placeholder="1010XXXXXX"
            />
          </div>
        </Field>
        <Field label="الرقم الضريبي">
          <Input
            value={form.tax}
            onChange={(e) => update("tax", e.target.value)}
            dir="ltr"
            className="text-left"
            placeholder="3XXXXXXXXX0003"
          />
        </Field>
      </div>
    </div>
  );
}

function GeneralSection() {
  const [s, setS] = useState({
    language: "ar",
    timezone: "asia-riyadh",
    currency: "sar",
    calendar: "both",
    dateFormat: "dmy",
  });
  const u = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="اللغة الافتراضية">
        <div className="relative">
          <Languages className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select options={languages} value={s.language} onChange={(e) => u("language", e.target.value)} />
        </div>
      </Field>
      <Field label="المنطقة الزمنية">
        <div className="relative">
          <Clock className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select options={timezones} value={s.timezone} onChange={(e) => u("timezone", e.target.value)} />
        </div>
      </Field>
      <Field label="العملة">
        <div className="relative">
          <DollarSign className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select options={currencies} value={s.currency} onChange={(e) => u("currency", e.target.value)} />
        </div>
      </Field>
      <Field label="التقويم الافتراضي">
        <div className="relative">
          <Calendar className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select options={calendars} value={s.calendar} onChange={(e) => u("calendar", e.target.value)} />
        </div>
      </Field>
      <Field label="تنسيق التاريخ">
        <Select options={dateFormats} value={s.dateFormat} onChange={(e) => u("dateFormat", e.target.value)} />
      </Field>
    </div>
  );
}

function NotificationsSection() {
  const [n, setN] = useState({
    email: true,
    sms: false,
    push: true,
    sessions: true,
    deadlines: true,
    payments: true,
    newRequests: true,
    weekly: false,
  });
  const u = <K extends keyof typeof n>(k: K, v: boolean) => setN((p) => ({ ...p, [k]: v }));

  const items: { key: keyof typeof n; title: string; desc: string }[] = [
    { key: "email", title: "إشعارات البريد الإلكتروني", desc: "تلقي الإشعارات على البريد الإلكتروني" },
    { key: "sms", title: "إشعارات الرسائل النصية (SMS)", desc: "تلقي الإشعارات على رقم الجوال" },
    { key: "push", title: "إشعارات داخل النظام", desc: "تنبيهات داخل لوحة التحكم" },
    { key: "sessions", title: "تذكير بالجلسات", desc: "تنبيه قبل الجلسات بـ 24 ساعة" },
    { key: "deadlines", title: "تذكير بالمواعيد النهائية", desc: "تنبيه قبل انتهاء العقود والمستحقات" },
    { key: "payments", title: "إشعارات المدفوعات", desc: "عند استلام دفعة جديدة أو تأخر دفعة" },
    { key: "newRequests", title: "طلبات جديدة", desc: "عند ورود طلب استشارة أو قضية جديدة" },
    { key: "weekly", title: "تقرير أسبوعي", desc: "ملخص أداء المكتب أسبوعياً" },
  ];

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div
          key={it.key}
          className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50"
        >
          <Toggle checked={n[it.key]} onChange={(v) => u(it.key, v)} />
          <div className="flex-1 text-right">
            <div className="text-sm font-bold text-slate-700">{it.title}</div>
            <div className="text-xs text-slate-500 mt-1">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BackupSection() {
  const [auto, setAuto] = useState(true);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200">
        <Toggle checked={auto} onChange={setAuto} />
        <div className="flex-1 text-right">
          <h4 className="text-sm font-bold text-slate-700">النسخ الاحتياطي التلقائي</h4>
          <p className="text-xs text-slate-500 mt-1">
            ينشئ نسخة احتياطية يومياً في الساعة 2:00 صباحاً تلقائياً
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3 text-right flex items-center justify-end gap-2">
          آخر نسخة احتياطية
          <Database className="w-4 h-4 text-brand-500" />
        </h3>
        <div className="text-sm text-slate-500 text-right">لم يتم إنشاء نسخة احتياطية بعد</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="card p-5 hover:bg-brand-50 hover:border-brand-200 transition text-right">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-sm font-bold text-slate-800">إنشاء نسخة احتياطية الآن</div>
              <div className="text-xs text-slate-500 mt-1">تنزيل نسخة من جميع البيانات</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </button>

        <button className="card p-5 hover:bg-brand-50 hover:border-brand-200 transition text-right">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-sm font-bold text-slate-800">استعادة من نسخة احتياطية</div>
              <div className="text-xs text-slate-500 mt-1">رفع ملف نسخة احتياطية سابقة</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-right flex-1 leading-6">
          النسخ الاحتياطية مشفّرة ومخزّنة بأمان. ينصح بالاحتفاظ بنسخة محلية إضافية في مكان آمن.
        </p>
      </div>
    </div>
  );
}

function ActivitySection() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
      <Activity className="w-14 h-14 mb-3" strokeWidth={1.2} />
      <p className="text-sm text-slate-500">لا توجد نشاطات مسجّلة بعد</p>
      <p className="text-xs text-slate-400 mt-1">سيتم تسجيل جميع تغييرات النظام هنا</p>
    </div>
  );
}
