import { useEffect, useRef, useState } from "react";
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
  Loader2,
  Check,
  Trash2,
  User as UserIcon,
  Sliders,
  Plus,
  Edit3,
  X,
  Briefcase,
  Gavel,
} from "lucide-react";
import { Field, Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import Toggle from "../components/ui/Toggle";
import {
  useOffice,
  updateOffice,
  defaultNotifications,
  type OfficeInfo,
  type NotificationPrefs,
  type CaseOption,
  createBackup,
  downloadBackup,
  restoreBackup,
  logActivity,
  useActivities,
  clearActivities,
  type BackupPayload,
} from "../lib/officeStore";

const tabs = [
  { key: "office", label: "بيانات المكتب", icon: Building },
  { key: "general", label: "الإعدادات العامة", icon: Settings },
  { key: "forms", label: "تخصيص النماذج", icon: Sliders },
  { key: "notifications", label: "الإشعارات", icon: Bell },
  { key: "backup", label: "النسخ الاحتياطي", icon: Database },
  { key: "activity", label: "سجل النشاطات", icon: Activity },
] as const;

type TabKey = (typeof tabs)[number]["key"];

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

type SaveState = "idle" | "saving" | "saved" | "error";

export default function Admin() {
  const [tab, setTab] = useState<TabKey>("office");
  const { office, loading, refresh, isConfigured } = useOffice();
  const [draft, setDraft] = useState<OfficeInfo | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Sync draft from server, but don't clobber unsaved edits
  const lastServerSnapshot = useRef<string>("");
  useEffect(() => {
    if (!office) return;
    const snap = JSON.stringify(office);
    if (snap === lastServerSnapshot.current) return;
    lastServerSnapshot.current = snap;
    setDraft(office);
  }, [office]);

  const dirty =
    draft && office ? JSON.stringify(draft) !== JSON.stringify(office) : false;

  const update = <K extends keyof OfficeInfo>(k: K, v: OfficeInfo[K]) => {
    setDraft((p) => (p ? { ...p, [k]: v } : p));
    if (saveState === "saved") setSaveState("idle");
  };

  const handleSave = async () => {
    if (!draft || !office || !dirty) return;
    if (!isConfigured || !draft.id) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    const ok = await updateOffice(draft.id, draft);
    if (ok) {
      setSaveState("saved");
      const changedKeys = (Object.keys(draft) as (keyof OfficeInfo)[]).filter(
        (k) => JSON.stringify(draft[k]) !== JSON.stringify(office[k])
      );
      await logActivity({
        action: "update_office",
        category: "office",
        description: getActivityDescription(tab, changedKeys),
        meta: { tab, changed: changedKeys.map(String) },
      });
      await refresh();
      setTimeout(() => setSaveState("idle"), 2000);
    } else {
      setSaveState("error");
    }
  };

  if (loading || !draft) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">جارٍ تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-start">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          الإدارة
          <Building2 className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      {!isConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-right flex-1 leading-6">
            Supabase غير مهيّأ في هذه البيئة. التعديلات لن تُحفظ. الرجاء ضبط
            <bdi dir="ltr"> VITE_SUPABASE_URL</bdi> و
            <bdi dir="ltr"> VITE_SUPABASE_ANON_KEY</bdi>.
          </p>
        </div>
      )}

      <div className="card">
        <div className="border-b border-slate-200 flex flex-wrap justify-start gap-y-1">
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

        <div className="p-6">
          {tab === "office" && <OfficeSection draft={draft} update={update} />}
          {tab === "general" && <GeneralSection draft={draft} update={update} />}
          {tab === "forms" && <FormsSection draft={draft} update={update} />}
          {tab === "notifications" && (
            <NotificationsSection draft={draft} update={update} />
          )}
          {tab === "backup" && <BackupSection draft={draft} update={update} />}
          {tab === "activity" && <ActivitySection />}
        </div>
      </div>

      {tab !== "activity" && tab !== "backup" && (
        <div className="flex items-center justify-start gap-3">
          <button
            disabled={!dirty || saveState === "saving"}
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold shadow transition ${
              !dirty || saveState === "saving"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {saveState === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveState === "saving"
              ? "جارٍ الحفظ..."
              : saveState === "saved"
              ? "تم الحفظ"
              : "حفظ التغييرات"}
          </button>
          {dirty && saveState === "idle" && (
            <span className="text-xs text-amber-600">يوجد تغييرات غير محفوظة</span>
          )}
          {saveState === "error" && (
            <span className="text-xs text-rose-600">حدث خطأ أثناء الحفظ</span>
          )}
        </div>
      )}
    </div>
  );
}

function getActivityDescription(tab: TabKey, _keys: (keyof OfficeInfo)[]): string {
  switch (tab) {
    case "office":
      return "تحديث بيانات المكتب";
    case "general":
      return "تحديث الإعدادات العامة";
    case "notifications":
      return "تحديث إعدادات الإشعارات";
    case "backup":
      return "تحديث إعدادات النسخ الاحتياطي";
    default:
      return "تحديث الإعدادات";
  }
}

// ============================================================
// Office Section
// ============================================================

type SectionProps = {
  draft: OfficeInfo;
  update: <K extends keyof OfficeInfo>(k: K, v: OfficeInfo[K]) => void;
};

function OfficeSection({ draft, update }: SectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="اسم المكتب الكامل">
          <div className="relative">
            <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={draft.officeName}
              onChange={(e) => update("officeName", e.target.value)}
              className="pr-10"
            />
          </div>
        </Field>
        <Field label="الاسم المختصر (يظهر في الشريط الجانبي)">
          <Input
            value={draft.shortName}
            onChange={(e) => update("shortName", e.target.value)}
          />
        </Field>
        <Field label="رقم الجوال / الهاتف">
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={draft.phone}
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
              value={draft.email}
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
              value={draft.website}
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
              value={draft.address}
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
              value={draft.crNumber}
              onChange={(e) => update("crNumber", e.target.value)}
              dir="ltr"
              className="text-left pr-10"
              placeholder="1010XXXXXX"
            />
          </div>
        </Field>
        <Field label="الرقم الضريبي">
          <Input
            value={draft.taxNumber}
            onChange={(e) => update("taxNumber", e.target.value)}
            dir="ltr"
            className="text-left"
            placeholder="3XXXXXXXXX0003"
          />
        </Field>
      </div>
    </div>
  );
}

// ============================================================
// General Section
// ============================================================

function GeneralSection({ draft, update }: SectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="اللغة الافتراضية">
        <div className="relative">
          <Languages className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select
            className="pr-10"
            options={languages}
            value={draft.language}
            onChange={(e) => update("language", e.target.value)}
          />
        </div>
      </Field>
      <Field label="المنطقة الزمنية">
        <div className="relative">
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select
            className="pr-10"
            options={timezones}
            value={draft.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          />
        </div>
      </Field>
      <Field label="العملة">
        <div className="relative">
          <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select
            className="pr-10"
            options={currencies}
            value={draft.currency}
            onChange={(e) => update("currency", e.target.value)}
          />
        </div>
      </Field>
      <Field label="التقويم الافتراضي">
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select
            className="pr-10"
            options={calendars}
            value={draft.calendarFormat}
            onChange={(e) => update("calendarFormat", e.target.value)}
          />
        </div>
      </Field>
      <Field label="تنسيق التاريخ">
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Select
            className="pr-10"
            options={dateFormats}
            value={draft.dateFormat}
            onChange={(e) => update("dateFormat", e.target.value)}
          />
        </div>
      </Field>
    </div>
  );
}

// ============================================================
// Notifications Section
// ============================================================

function NotificationsSection({ draft, update }: SectionProps) {
  const n = { ...defaultNotifications, ...draft.notifications };
  const toggle = (k: keyof NotificationPrefs, v: boolean) =>
    update("notifications", { ...n, [k]: v });

  const items: { key: keyof NotificationPrefs; title: string; desc: string }[] = [
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
          <Toggle checked={n[it.key]} onChange={(v) => toggle(it.key, v)} />
          <div className="flex-1 text-right">
            <div className="text-sm font-bold text-slate-700">{it.title}</div>
            <div className="text-xs text-slate-500 mt-1">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Backup Section
// ============================================================

function BackupSection({ draft, update }: SectionProps) {
  const [busy, setBusy] = useState<"idle" | "creating" | "restoring">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAutoToggle = async (v: boolean) => {
    update("backupAuto", v);
    await updateOffice(draft.id, { backupAuto: v });
    await logActivity({
      action: "toggle_backup_auto",
      category: "backup",
      description: v ? "تفعيل النسخ الاحتياطي التلقائي" : "إيقاف النسخ الاحتياطي التلقائي",
    });
  };

  const handleBackup = async () => {
    setBusy("creating");
    setResult(null);
    setError(null);
    try {
      const payload = await createBackup();
      if (!payload) {
        setError("تعذّر إنشاء النسخة الاحتياطية");
        setBusy("idle");
        return;
      }
      downloadBackup(payload);
      const now = new Date().toISOString();
      await updateOffice(draft.id, { lastBackupAt: now });
      update("lastBackupAt", now);
      await logActivity({
        action: "backup_create",
        category: "backup",
        description: "إنشاء نسخة احتياطية يدوية",
        meta: {
          counts: Object.fromEntries(
            Object.entries(payload.tables).map(([k, v]) => [k, (v as unknown[]).length])
          ),
        },
      });
      setResult("تم إنشاء النسخة الاحتياطية بنجاح وتنزيل الملف.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("idle");
    }
  };

  const handleRestoreClick = () => {
    fileRef.current?.click();
  };

  const handleRestoreFile = async (file: File) => {
    if (!confirm("سيتم استعادة البيانات من الملف. سيتم تحديث السجلات الموجودة بنفس المعرف. هل تريد المتابعة؟")) {
      return;
    }
    setBusy("restoring");
    setResult(null);
    setError(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as BackupPayload;
      const res = await restoreBackup(payload);
      if (!res.ok) {
        setError(`فشلت الاستعادة جزئياً: ${res.errors.join(" | ")}`);
      } else {
        const total = Object.values(res.inserted).reduce((a, b) => a + b, 0);
        setResult(`تمت الاستعادة بنجاح. (${total} سجل)`);
        await logActivity({
          action: "backup_restore",
          category: "backup",
          description: "استعادة من نسخة احتياطية",
          meta: { inserted: res.inserted },
        });
      }
    } catch (e) {
      setError(`ملف غير صالح: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy("idle");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200">
        <Toggle checked={draft.backupAuto} onChange={handleAutoToggle} />
        <div className="flex-1 text-right">
          <h4 className="text-sm font-bold text-slate-700">النسخ الاحتياطي التلقائي</h4>
          <p className="text-xs text-slate-500 mt-1">
            تذكير بإنشاء نسخة احتياطية يومياً (يتطلب الضغط اليدوي حالياً)
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3 text-right flex items-center justify-start gap-2">
          آخر نسخة احتياطية
          <Database className="w-4 h-4 text-brand-500" />
        </h3>
        <div className="text-sm text-slate-500 text-right">
          {draft.lastBackupAt ? (
            <bdi dir="ltr">
              {new Date(draft.lastBackupAt).toLocaleString("ar-EG-u-nu-latn", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </bdi>
          ) : (
            "لم يتم إنشاء نسخة احتياطية بعد"
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleBackup}
          disabled={busy !== "idle"}
          className="card p-5 hover:bg-brand-50 hover:border-brand-200 transition text-right disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-sm font-bold text-slate-800">إنشاء نسخة احتياطية الآن</div>
              <div className="text-xs text-slate-500 mt-1">تنزيل نسخة من جميع البيانات</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              {busy === "creating" ? (
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-emerald-600" />
              )}
            </div>
          </div>
        </button>

        <button
          onClick={handleRestoreClick}
          disabled={busy !== "idle"}
          className="card p-5 hover:bg-brand-50 hover:border-brand-200 transition text-right disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-sm font-bold text-slate-800">استعادة من نسخة احتياطية</div>
              <div className="text-xs text-slate-500 mt-1">رفع ملف نسخة احتياطية سابقة</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              {busy === "restoring" ? (
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-amber-600" />
              )}
            </div>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleRestoreFile(f);
          }}
        />
      </div>

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 text-right">
          {result}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 text-right">
          {error}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-right flex-1 leading-6">
          النسخ الاحتياطية تحوي جميع جداول النظام بصيغة JSON. ينصح بالاحتفاظ بنسخة محلية في مكان آمن.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Activity Section
// ============================================================

// ============================================================
// Forms Customization Section
// ============================================================

function FormsSection({ draft, update }: SectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-3 text-xs text-brand-800 flex items-start gap-2">
        <Sliders className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-right flex-1 leading-6">
          خصّص قوائم القضايا والمحاكم المستخدمة في صفحات إنشاء/تعديل القضية.
          التغييرات تنعكس فوراً في كل النظام بعد الحفظ.
        </p>
      </div>

      <OptionsEditor
        title="أنواع القضايا"
        icon={Briefcase}
        value={draft.caseTypes}
        onChange={(v) => update("caseTypes", v)}
      />

      <OptionsEditor
        title="أنواع المحاكم"
        icon={Gavel}
        value={draft.courtTypes}
        onChange={(v) => update("courtTypes", v)}
      />
    </div>
  );
}

function OptionsEditor({
  title,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: CaseOption[];
  onChange: (v: CaseOption[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const slug = () =>
    "opt-" +
    Math.random().toString(36).slice(2, 6) +
    "-" +
    Date.now().toString(36);

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    onChange([...value, { value: slug(), label }]);
    setNewLabel("");
  };

  const remove = (v: string) => {
    if (!confirm("هل تريد حذف هذا الخيار؟")) return;
    onChange(value.filter((o) => o.value !== v));
  };

  const startEdit = (o: CaseOption) => {
    setEditingValue(o.value);
    setEditingLabel(o.label);
  };

  const saveEdit = () => {
    if (!editingValue) return;
    const label = editingLabel.trim();
    if (!label) {
      setEditingValue(null);
      return;
    }
    onChange(
      value.map((o) =>
        o.value === editingValue ? { ...o, label } : o
      )
    );
    setEditingValue(null);
    setEditingLabel("");
  };

  const cancelEdit = () => {
    setEditingValue(null);
    setEditingLabel("");
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <span className="text-xs text-slate-500">
          {value.length} خيار
        </span>
        <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800">
          {title}
          <Icon className="w-4 h-4 text-brand-500" />
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={add}
          disabled={!newLabel.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة
        </button>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="اسم الخيار الجديد..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      <ul className="space-y-2">
        {value.length === 0 ? (
          <li className="text-xs text-slate-400 text-center py-4">
            لا توجد خيارات — أضف الأول
          </li>
        ) : (
          value.map((o) => (
            <li
              key={o.value}
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              {editingValue === o.value ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                    title="إلغاء"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md"
                    title="حفظ"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <input
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit();
                      } else if (e.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    className="flex-1 px-2 py-1.5 bg-white border border-brand-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
                    autoFocus
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => remove(o.value)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(o)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                    title="تعديل"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 text-right">
                    <span className="text-sm text-slate-700">{o.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono mr-2" dir="ltr">
                      {o.value}
                    </span>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ActivitySection() {
  const { items, loading } = useActivities(200);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!confirm("سيتم مسح جميع سجلات النشاطات. هل تريد المتابعة؟")) return;
    setClearing(true);
    await clearActivities();
    setClearing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
        <Activity className="w-14 h-14 mb-3" strokeWidth={1.2} />
        <p className="text-sm text-slate-500">لا توجد نشاطات مسجّلة بعد</p>
        <p className="text-xs text-slate-400 mt-1">سيتم تسجيل جميع تغييرات النظام هنا</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={handleClear}
          disabled={clearing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
        >
          {clearing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          مسح السجل
        </button>
        <div className="text-xs text-slate-500">
          إجمالي السجلات: <bdi dir="ltr">{items.length}</bdi>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => {
          const color = categoryColor(it.category);
          return (
            <div
              key={it.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${color.bg}`}
              >
                <UserIcon className={`w-4 h-4 ${color.text}`} />
              </div>
              <div className="flex-1 text-right min-w-0">
                <div className="text-sm font-bold text-slate-700">
                  {it.description ?? it.action}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap justify-end">
                  <span>{it.actorName ?? "النظام"}</span>
                  <span className="text-slate-300">•</span>
                  <bdi dir="ltr">
                    {new Date(it.createdAt).toLocaleString("ar-EG-u-nu-latn", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </bdi>
                  {it.category && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${color.bg} ${color.text}`}
                      >
                        {categoryLabel(it.category)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function categoryColor(category: string | null): { bg: string; text: string } {
  switch (category) {
    case "office":
      return { bg: "bg-blue-100", text: "text-blue-600" };
    case "backup":
      return { bg: "bg-emerald-100", text: "text-emerald-600" };
    case "client":
      return { bg: "bg-purple-100", text: "text-purple-600" };
    case "case":
      return { bg: "bg-amber-100", text: "text-amber-600" };
    case "task":
      return { bg: "bg-rose-100", text: "text-rose-600" };
    case "contract":
      return { bg: "bg-indigo-100", text: "text-indigo-600" };
    case "auth":
      return { bg: "bg-slate-100", text: "text-slate-600" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-500" };
  }
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    office: "المكتب",
    backup: "نسخ احتياطي",
    client: "عميل",
    case: "قضية",
    task: "مهمة",
    contract: "عقد",
    auth: "حساب",
  };
  return labels[category] ?? category;
}
