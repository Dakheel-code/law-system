import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Save,
  RotateCcw,
  Check,
  Type,
  Layout,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { Field, Input } from "../components/ui/Field";
import Toggle from "../components/ui/Toggle";
import LogoUpload from "../components/users/LogoUpload";
import { useTheme } from "../context/ThemeContext";
import { colorThemes, fonts } from "../lib/themes";

const modes = [
  { key: "light" as const, label: "فاتح", icon: Sun },
  { key: "dark" as const, label: "داكن", icon: Moon },
  { key: "system" as const, label: "تلقائي", icon: Monitor },
];

export default function Theme() {
  const { theme, update, reset } = useTheme();

  const activeColor = colorThemes.find((c) => c.key === theme.color);
  const activeFont = fonts.find((f) => f.key === theme.font);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          تخصيص الواجهة
          <Palette className="w-5 h-5 text-brand-500" />
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة الافتراضي
          </button>
          <button
            onClick={() => alert("تم حفظ التغييرات تلقائياً ✓")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-5">
          {/* Theme color */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              اللون الرئيسي
              <Sparkles className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {colorThemes.map((c) => {
                const active = theme.color === c.key && !theme.customPrimary;
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      update("color", c.key);
                      update("customPrimary", null);
                    }}
                    className={`relative h-16 rounded-xl shadow-card transition hover:scale-105 ${
                      active ? "ring-4 ring-offset-2 ring-slate-300" : ""
                    }`}
                    style={{ backgroundColor: c.preview }}
                    title={c.name}
                  >
                    {active && (
                      <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-right">
              {theme.customPrimary ? (
                <>
                  لون مخصص: <span className="font-bold font-mono" dir="ltr">{theme.customPrimary}</span>
                  <span className="text-emerald-600 mr-2">✓ يُطبَّق فوراً</span>
                </>
              ) : (
                <>
                  اللون المختار: <span className="font-bold">{activeColor?.name}</span>
                  <span className="text-emerald-600 mr-2">✓ يُطبَّق فوراً على كل النظام</span>
                </>
              )}
            </p>

            {/* Custom hex picker for primary */}
            <CustomHexPicker
              label="أو اختر لوناً مخصصاً (رئيسي)"
              value={theme.customPrimary ?? ""}
              onChange={(v) => update("customPrimary", v || null)}
              hint="مثال: #1e9a8a — يتجاوز اللون المختار أعلاه"
            />
          </div>

          {/* Accent (secondary) color */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              اللون الثانوي (Accent)
              <Sparkles className="w-4 h-4 text-brand-500" />
            </h3>
            <p className="text-xs text-slate-500 mb-3 text-right leading-6">
              لون ثانوي يُولِّد تدرّجاً كاملاً (accent-50 … accent-900) يمكن استخدامه للنصوص والعناصر الثانوية.
              إذا لم تُحدِّده، يستخدم النظام نفس اللون الرئيسي.
            </p>
            <CustomHexPicker
              label="اللون الثانوي"
              value={theme.customAccent ?? ""}
              onChange={(v) => update("customAccent", v || null)}
              hint="مثال: #8b5cf6"
            />
          </div>

          {/* Mode */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              وضع العرض
              <Sun className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {modes.map((m) => {
                const Icon = m.icon;
                const active = theme.mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => update("mode", m.key)}
                    className={`p-4 rounded-xl border-2 transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        active ? "text-brand-500" : "text-slate-400"
                      }`}
                    />
                    <div className="text-sm font-bold">{m.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo & Name */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              الشعار واسم المكتب
              <ImageIcon className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="اسم المكتب الكامل">
                <Input
                  value={theme.officeName}
                  onChange={(e) => update("officeName", e.target.value)}
                />
              </Field>
              <Field label="الاسم المختصر">
                <Input
                  value={theme.shortName}
                  onChange={(e) => update("shortName", e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
                  شعار المكتب
                </label>
                <LogoUpload
                  value={theme.logoDataUrl}
                  onChange={(v) => update("logoDataUrl", v)}
                />
                <p className="text-xs text-slate-400 mt-1.5 text-right">
                  سيظهر في الشريط الجانبي وصفحة الدخول
                </p>
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              نوع الخط
              <Type className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="space-y-2">
              {fonts.map((f) => {
                const active = theme.font === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => update("font", f.key)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${
                      active
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="text-2xl text-slate-700"
                      style={{ fontFamily: f.family }}
                    >
                      نظام إدارة
                    </span>
                    <div className="flex items-center gap-2">
                      {active && <Check className="w-5 h-5 text-brand-500" />}
                      <span
                        className={`text-sm font-bold ${
                          active ? "text-brand-700" : "text-slate-600"
                        }`}
                      >
                        {f.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout */}
          <div className="card p-5">
            <h3 className="flex items-center justify-start gap-2 text-base font-bold text-slate-800 mb-4">
              تخطيط الواجهة
              <Layout className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle
                  checked={theme.sidebarPosition === "right"}
                  onChange={(v) => update("sidebarPosition", v ? "right" : "left")}
                />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">
                    الشريط الجانبي يمين
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    RTL — مناسب للعربية (افتراضي)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle
                  checked={theme.sidebarCollapsed}
                  onChange={(v) => update("sidebarCollapsed", v)}
                />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">
                    طي الشريط الجانبي افتراضياً
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    عرض الأيقونات فقط لمساحة أكبر للمحتوى
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle
                  checked={theme.compactMode}
                  onChange={(v) => update("compactMode", v)}
                />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">
                    الوضع المكثّف
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    تقليل الحشوات لعرض محتوى أكثر
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-3 lg:sticky lg:top-24 self-start">
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-700">معاينة مباشرة</h3>
            <p className="text-xs text-slate-400">التغييرات تظهر فوراً</p>
          </div>

          <div className="card overflow-hidden">
            <div className="p-5 text-white bg-gradient-to-l from-brand-700 to-brand-500">
              <div className="flex items-center justify-between mb-3">
                {theme.logoDataUrl ? (
                  <img
                    src={theme.logoDataUrl}
                    alt="logo"
                    className="h-10 w-auto bg-white/20 rounded-lg p-1"
                  />
                ) : (
                  <Sparkles className="w-5 h-5 opacity-80" />
                )}
                <div className="text-right">
                  <div className="text-xs opacity-90">{theme.shortName}</div>
                  <div className="text-lg font-extrabold mt-0.5">{theme.officeName}</div>
                </div>
              </div>
              <p className="text-sm opacity-90 text-right">معاينة شريط الترحيب</p>
            </div>

            <div className="p-4 space-y-3">
              <button className="w-full py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
                زر رئيسي
              </button>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-600 font-bold">رابط ملوّن</span>
                <span className="text-slate-700">عينة نص عادي</span>
              </div>
              <div className="rounded-lg p-3 text-xs bg-brand-50 text-brand-700">
                مربع تنبيه بنفس اللون
              </div>
            </div>
          </div>

          <div className="card p-3 text-xs text-slate-500 text-right">
            الوضع: <span className="font-bold text-slate-700">{modes.find((m) => m.key === theme.mode)?.label}</span> ·
            الخط: <span className="font-bold text-slate-700">{activeFont?.name.split(" ")[0]}</span>
          </div>

          {/* Accent preview chips */}
          <div className="card p-3 space-y-2">
            <div className="text-[11px] text-slate-500 text-right mb-1">
              الألوان النشطة
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-brand-300 border border-slate-200" />
                <span className="w-4 h-4 rounded bg-brand-500 border border-slate-200" />
                <span className="w-4 h-4 rounded bg-brand-700 border border-slate-200" />
              </div>
              <span className="text-slate-600">رئيسي</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-accent-300 border border-slate-200" />
                <span className="w-4 h-4 rounded bg-accent-500 border border-slate-200" />
                <span className="w-4 h-4 rounded bg-accent-700 border border-slate-200" />
              </div>
              <span className="text-slate-600">ثانوي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Custom hex color picker
// ============================================================

function CustomHexPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value) || value === "";
  return (
    <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
      <label className="block text-xs font-bold text-slate-500 mb-2 text-right">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={!value}
          className="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          إزالة
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v && !v.startsWith("#")) v = "#" + v;
            onChange(v);
          }}
          placeholder="#000000"
          dir="ltr"
          className={`flex-1 px-3 py-2 bg-slate-50 border rounded-lg text-sm text-left font-mono focus:outline-none focus:ring-2 ${
            isValid
              ? "border-slate-200 focus:ring-brand-200"
              : "border-rose-300 focus:ring-rose-200 text-rose-700"
          }`}
        />
        <div className="relative shrink-0">
          <input
            type="color"
            value={isValid && value ? value : "#1e9a8a"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="اختر لوناً"
          />
          <div
            className="w-10 h-10 rounded-lg border-2 border-slate-200 shadow-sm"
            style={{ backgroundColor: isValid && value ? value : "transparent" }}
          />
        </div>
      </div>
      {hint && (
        <p className="text-[11px] text-slate-400 mt-1.5 text-right">{hint}</p>
      )}
      {!isValid && value && (
        <p className="text-[11px] text-rose-600 mt-1 text-right">
          صيغة غير صحيحة. مثال: #1e9a8a
        </p>
      )}
    </div>
  );
}
