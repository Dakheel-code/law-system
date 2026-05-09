import { useState } from "react";
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

const colorThemes = [
  { key: "teal", name: "أخضر مزرق", color: "#1e9a8a", from: "from-brand-500", to: "to-brand-600" },
  { key: "blue", name: "أزرق", color: "#3b82f6", from: "from-blue-500", to: "to-blue-600" },
  { key: "purple", name: "بنفسجي", color: "#8b5cf6", from: "from-violet-500", to: "to-violet-600" },
  { key: "rose", name: "وردي", color: "#f43f5e", from: "from-rose-500", to: "to-rose-600" },
  { key: "amber", name: "عسلي", color: "#f59e0b", from: "from-amber-500", to: "to-amber-600" },
  { key: "emerald", name: "أخضر", color: "#10b981", from: "from-emerald-500", to: "to-emerald-600" },
  { key: "slate", name: "رمادي", color: "#475569", from: "from-slate-500", to: "to-slate-600" },
  { key: "indigo", name: "نيلي", color: "#6366f1", from: "from-indigo-500", to: "to-indigo-600" },
];

const fonts = [
  { key: "tajawal", name: "Tajawal — تجوال", sample: "نظام إدارة" },
  { key: "cairo", name: "Cairo — القاهرة", sample: "نظام إدارة" },
  { key: "ibm", name: "IBM Plex Arabic", sample: "نظام إدارة" },
  { key: "noto", name: "Noto Sans Arabic", sample: "نظام إدارة" },
];

const modes = [
  { key: "light", label: "فاتح", icon: Sun },
  { key: "dark", label: "داكن", icon: Moon },
  { key: "system", label: "تلقائي", icon: Monitor },
];

export default function Theme() {
  const [theme, setTheme] = useState({
    color: "teal",
    mode: "light",
    font: "tajawal",
    sidebarPosition: "right",
    sidebarCollapsed: false,
    compactMode: false,
    officeName: "شركة ناصر طريد للمحاماة",
    shortName: "ناصر طريد",
  });

  const u = <K extends keyof typeof theme>(k: K, v: (typeof theme)[K]) =>
    setTheme((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setTheme({
      color: "teal",
      mode: "light",
      font: "tajawal",
      sidebarPosition: "right",
      sidebarCollapsed: false,
      compactMode: false,
      officeName: "شركة ناصر طريد للمحاماة",
      shortName: "ناصر طريد",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة الافتراضي
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
          تخصيص الواجهة
          <Palette className="w-5 h-5 text-brand-500" />
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-5">
          {/* Theme color */}
          <div className="card p-5">
            <h3 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4">
              اللون الرئيسي
              <Sparkles className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {colorThemes.map((c) => {
                const active = theme.color === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => u("color", c.key)}
                    className={`relative h-16 rounded-xl shadow-card transition hover:scale-105 ${
                      active ? "ring-4 ring-offset-2 ring-slate-300" : ""
                    }`}
                    style={{ backgroundColor: c.color }}
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
              اللون المختار: <span className="font-bold">{colorThemes.find((c) => c.key === theme.color)?.name}</span>
            </p>
          </div>

          {/* Mode */}
          <div className="card p-5">
            <h3 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4">
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
                    onClick={() => u("mode", m.key)}
                    className={`p-4 rounded-xl border-2 transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${active ? "text-brand-500" : "text-slate-400"}`} />
                    <div className="text-sm font-bold">{m.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo & Name */}
          <div className="card p-5">
            <h3 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4">
              الشعار واسم المكتب
              <ImageIcon className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="اسم المكتب الكامل">
                <Input value={theme.officeName} onChange={(e) => u("officeName", e.target.value)} />
              </Field>
              <Field label="الاسم المختصر">
                <Input value={theme.shortName} onChange={(e) => u("shortName", e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">شعار المكتب</label>
                <button className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600 transition">
                  <ImageIcon className="w-10 h-10 mb-2" strokeWidth={1.4} />
                  <span className="text-sm font-bold">اضغط لرفع الشعار</span>
                  <span className="text-xs mt-1">PNG, SVG, JPG — حتى 2MB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="card p-5">
            <h3 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4">
              نوع الخط
              <Type className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="space-y-2">
              {fonts.map((f) => {
                const active = theme.font === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => u("font", f.key)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${
                      active
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl text-slate-700">{f.sample}</span>
                    <div className="flex items-center gap-2">
                      {active && <Check className="w-5 h-5 text-brand-500" />}
                      <span className={`text-sm font-bold ${active ? "text-brand-700" : "text-slate-600"}`}>
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
            <h3 className="flex items-center justify-end gap-2 text-base font-bold text-slate-800 mb-4">
              تخطيط الواجهة
              <Layout className="w-4 h-4 text-brand-500" />
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle
                  checked={theme.sidebarPosition === "right"}
                  onChange={(v) => u("sidebarPosition", v ? "right" : "left")}
                />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">الشريط الجانبي يمين</div>
                  <div className="text-xs text-slate-500 mt-1">RTL — مناسب للعربية (افتراضي)</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle checked={theme.sidebarCollapsed} onChange={(v) => u("sidebarCollapsed", v)} />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">طي الشريط الجانبي افتراضياً</div>
                  <div className="text-xs text-slate-500 mt-1">عرض الأيقونات فقط لمساحة أكبر للمحتوى</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-200">
                <Toggle checked={theme.compactMode} onChange={(v) => u("compactMode", v)} />
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700">الوضع المكثّف</div>
                  <div className="text-xs text-slate-500 mt-1">تقليل الحشوات لعرض محتوى أكثر</div>
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
            <div
              className="p-5 text-white"
              style={{ background: `linear-gradient(to left, ${colorThemes.find((c) => c.key === theme.color)?.color}, ${colorThemes.find((c) => c.key === theme.color)?.color}dd)` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Sparkles className="w-5 h-5 opacity-80" />
                <div className="text-right">
                  <div className="text-xs opacity-90">{theme.shortName}</div>
                  <div className="text-lg font-extrabold mt-0.5">{theme.officeName}</div>
                </div>
              </div>
              <p className="text-sm opacity-90 text-right">معاينة شريط الترحيب</p>
            </div>

            <div className="p-4 space-y-3 bg-white">
              <button
                style={{ backgroundColor: colorThemes.find((c) => c.key === theme.color)?.color }}
                className="w-full py-2.5 text-white rounded-lg text-sm font-bold shadow"
              >
                زر رئيسي
              </button>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: colorThemes.find((c) => c.key === theme.color)?.color }} className="font-bold">
                  رابط ملوّن
                </span>
                <span className="text-slate-700">عينة نص عادي</span>
              </div>
              <div
                className="rounded-lg p-3 text-xs"
                style={{
                  backgroundColor: `${colorThemes.find((c) => c.key === theme.color)?.color}15`,
                  color: colorThemes.find((c) => c.key === theme.color)?.color,
                }}
              >
                مربع تنبيه بنفس اللون
              </div>
            </div>
          </div>

          <div className="card p-3 text-xs text-slate-500 text-right">
            الوضع: <span className="font-bold text-slate-700">{modes.find((m) => m.key === theme.mode)?.label}</span> ·
            الخط: <span className="font-bold text-slate-700">{fonts.find((f) => f.key === theme.font)?.name.split(" ")[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
