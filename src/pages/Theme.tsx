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
                const active = theme.color === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => update("color", c.key)}
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
              اللون المختار: <span className="font-bold">{activeColor?.name}</span>
              <span className="text-emerald-600 mr-2">✓ يُطبَّق فوراً على كل النظام</span>
            </p>
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
        </div>
      </div>
    </div>
  );
}
