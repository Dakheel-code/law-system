import { useState, type ReactNode } from "react";
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
  Pipette,
  Eye,
  Bell,
} from "lucide-react";
import { Field, Input } from "../components/ui/Field";
import Toggle from "../components/ui/Toggle";
import LogoUpload from "../components/users/LogoUpload";
import { useTheme } from "../context/ThemeContext";
import { colorThemes, fonts, paletteFromHex, themes } from "../lib/themes";

const modes = [
  { key: "light" as const, label: "فاتح", icon: Sun },
  { key: "dark" as const, label: "داكن", icon: Moon },
  { key: "system" as const, label: "تلقائي", icon: Monitor },
];

const SHADE_KEYS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export default function Theme() {
  const { theme, update, reset } = useTheme();
  const [savedFlash, setSavedFlash] = useState(false);

  const activeColor = colorThemes.find((c) => c.key === theme.color);
  const activeFont = fonts.find((f) => f.key === theme.font);

  // Effective palettes (mirror what applyTheme() actually applies)
  const primaryPalette =
    (theme.customPrimary && paletteFromHex(theme.customPrimary)) ||
    themes[theme.color];
  const accentPalette =
    (theme.customAccent && paletteFromHex(theme.customAccent)) || primaryPalette;

  const hasCustomAccent = !!(theme.customAccent && paletteFromHex(theme.customAccent));

  const handleSave = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const handleReset = () => {
    if (confirm("هل تريد إعادة كل إعدادات الواجهة إلى الافتراضي؟")) {
      reset();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-right">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
            تخصيص الواجهة
            <Palette className="w-5 h-5 text-brand-500" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            خصِّص الألوان والخطوط والشعار — التغييرات تُحفظ تلقائياً وتظهر فوراً
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 transition"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة الافتراضي
          </button>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold shadow transition ${
              savedFlash
                ? "bg-emerald-500 text-white"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {savedFlash ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedFlash ? "تم الحفظ" : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ============= Settings column ============= */}
        <div className="lg:col-span-2 space-y-5">
          {/* PRIMARY COLOR */}
          <Section
            icon={<Sparkles className="w-4 h-4 text-brand-500" />}
            title="اللون الرئيسي"
            subtitle="الأزرار، الروابط، الترويسة، وعناصر التحكم الأساسية"
          >
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
              {colorThemes.map((c) => {
                const active = theme.color === c.key && !theme.customPrimary;
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      update("color", c.key);
                      update("customPrimary", null);
                    }}
                    className={`group relative h-14 rounded-xl transition-all hover:-translate-y-0.5 ${
                      active
                        ? "ring-2 ring-offset-2 ring-offset-white shadow-lg scale-105"
                        : "ring-1 ring-slate-200 hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: c.preview,
                      ...(active && { boxShadow: `0 6px 16px -4px ${c.preview}80` }),
                      ...(active && { ["--tw-ring-color" as never]: c.preview }),
                    }}
                    title={c.name}
                  >
                    {active && (
                      <Check
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white drop-shadow"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active palette strip */}
            <div className="mt-4">
              <ShadeStrip palette={primaryPalette} />
            </div>

            {/* Selected info */}
            <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                <Check className="w-3.5 h-3.5" />
                يُطبَّق فوراً على كل النظام
              </span>
              <span className="text-slate-600">
                المختار:{" "}
                <span className="font-bold text-slate-800">
                  {theme.customPrimary ? (
                    <span className="font-mono" dir="ltr">
                      {theme.customPrimary}
                    </span>
                  ) : (
                    activeColor?.name
                  )}
                </span>
              </span>
            </div>

            {/* Custom hex picker */}
            <CustomHexPicker
              label="أو اختر لوناً مخصصاً"
              value={theme.customPrimary ?? ""}
              onChange={(v) => update("customPrimary", v || null)}
              hint="مثال: #1e9a8a — يتجاوز اللون أعلاه"
              suggestedColor={activeColor?.preview}
            />
          </Section>

          {/* ACCENT COLOR */}
          <Section
            icon={<Sparkles className="w-4 h-4 text-accent-500" />}
            title={
              <>
                اللون الثانوي{" "}
                <span className="text-xs font-normal text-slate-400">(Accent)</span>
              </>
            }
            subtitle="يستخدم للشارات، التأكيدات الثانوية، والتمييز — اتركه فارغاً ليتبع اللون الرئيسي"
          >
            <CustomHexPicker
              label="لون مخصص للـ Accent"
              value={theme.customAccent ?? ""}
              onChange={(v) => update("customAccent", v || null)}
              hint="مثال: #8b5cf6 — يولِّد تدرّجاً كاملاً من 50 إلى 900"
              suggestedColor="#8b5cf6"
            />

            {/* Accent palette strip + status */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">تدرّج اللون الثانوي:</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    hasCustomAccent ? "text-accent-600" : "text-slate-400"
                  }`}
                >
                  {hasCustomAccent ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> مفعَّل
                    </>
                  ) : (
                    <>يتبع اللون الرئيسي</>
                  )}
                </span>
              </div>
              <ShadeStrip palette={accentPalette} />
            </div>

            {/* Accent demo elements */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 mb-3 text-right font-bold">
                معاينة استخدام اللون الثانوي:
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  شارة ثانوية
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-500 text-white hover:bg-accent-600"
                >
                  زر ثانوي
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100"
                >
                  زر شفاف
                </button>
                <span className="text-xs font-bold text-accent-600">رابط ثانوي</span>
              </div>
            </div>
          </Section>

          {/* MODE */}
          <Section
            icon={<Sun className="w-4 h-4 text-brand-500" />}
            title="وضع العرض"
            subtitle="فاتح أو داكن — أو تلقائي حسب نظام التشغيل"
          >
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
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600"
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
          </Section>

          {/* LOGO & NAME */}
          <Section
            icon={<ImageIcon className="w-4 h-4 text-brand-500" />}
            title="الشعار واسم المكتب"
            subtitle="يظهر في الشريط الجانبي، صفحة الدخول، وعنوان المتصفح"
          >
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
                  PNG / SVG شفافة الخلفية تُعطي أفضل نتيجة
                </p>
              </div>
            </div>
          </Section>

          {/* FONT */}
          <Section
            icon={<Type className="w-4 h-4 text-brand-500" />}
            title="نوع الخط"
            subtitle="الخط المستخدم في كل النصوص"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fonts.map((f) => {
                const active = theme.font === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => update("font", f.key)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition text-right ${
                      active
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {active && <Check className="w-4 h-4 text-brand-500" />}
                      <span
                        className={`text-xs font-bold ${
                          active ? "text-brand-700" : "text-slate-500"
                        }`}
                      >
                        {f.name}
                      </span>
                    </div>
                    <span
                      className="text-xl text-slate-700"
                      style={{ fontFamily: f.family }}
                    >
                      نظام إدارة
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* LAYOUT */}
          <Section
            icon={<Layout className="w-4 h-4 text-brand-500" />}
            title="تخطيط الواجهة"
            subtitle="إعدادات الشريط الجانبي وكثافة العرض"
          >
            <div className="space-y-2.5">
              <ToggleRow
                checked={theme.sidebarPosition === "right"}
                onChange={(v) => update("sidebarPosition", v ? "right" : "left")}
                title="الشريط الجانبي يمين"
                subtitle="RTL — مناسب للعربية (افتراضي)"
              />
              <ToggleRow
                checked={theme.sidebarCollapsed}
                onChange={(v) => update("sidebarCollapsed", v)}
                title="طي الشريط الجانبي افتراضياً"
                subtitle="عرض الأيقونات فقط لمساحة أكبر للمحتوى"
              />
              <ToggleRow
                checked={theme.compactMode}
                onChange={(v) => update("compactMode", v)}
                title="الوضع المكثّف"
                subtitle="تقليل الحشوات لعرض محتوى أكثر في الشاشة"
              />
            </div>
          </Section>
        </div>

        {/* ============= Live preview column ============= */}
        <div className="space-y-3 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">التغييرات تظهر فوراً</span>
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              معاينة مباشرة
              <Eye className="w-4 h-4 text-brand-500" />
            </h3>
          </div>

          {/* Mock app preview */}
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="p-5 text-white bg-gradient-to-l from-brand-700 to-brand-500">
              <div className="flex items-center justify-between mb-3">
                {theme.logoDataUrl ? (
                  <img
                    src={theme.logoDataUrl}
                    alt="logo"
                    className="h-10 w-auto bg-white/20 rounded-lg p-1"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 opacity-90" />
                  </div>
                )}
                <div className="text-right">
                  <div className="text-[11px] opacity-90">{theme.shortName}</div>
                  <div className="text-lg font-extrabold mt-0.5 leading-tight">
                    {theme.officeName}
                  </div>
                </div>
              </div>
              <p className="text-xs opacity-90 text-right">معاينة شريط الترحيب</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Buttons row */}
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow hover:bg-brand-600">
                  زر رئيسي
                </button>
                <button className="flex-1 py-2 bg-accent-500 text-white rounded-lg text-xs font-bold shadow hover:bg-accent-600">
                  زر ثانوي
                </button>
              </div>

              {/* Links */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-accent-600 font-bold">رابط ثانوي</span>
                <span className="text-brand-600 font-bold">رابط رئيسي</span>
                <span className="text-slate-600">نص عادي</span>
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5 text-[11px] bg-brand-50 text-brand-700 border border-brand-100 text-right">
                  تنبيه رئيسي
                </div>
                <div className="rounded-lg p-2.5 text-[11px] bg-accent-50 text-accent-700 border border-accent-100 text-right">
                  تنبيه ثانوي
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-100 text-accent-700">
                  ثانوية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                  رئيسية
                </span>
                <Bell className="w-3.5 h-3.5 text-brand-500" />
              </div>

              {/* Card with input */}
              <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50/50">
                <input
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                  placeholder="حقل إدخال نموذجي"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="card p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">
                {modes.find((m) => m.key === theme.mode)?.label}
              </span>
              <span className="text-slate-500">الوضع:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">
                {activeFont?.name.split(" ")[0]}
              </span>
              <span className="text-slate-500">الخط:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">
                {theme.compactMode ? "مكثّف" : "عادي"}
              </span>
              <span className="text-slate-500">الكثافة:</span>
            </div>
          </div>

          {/* Active palettes mini card */}
          <div className="card p-3 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-600 text-right">
              الألوان النشطة
            </div>
            <PaletteRow label="رئيسي" palette={primaryPalette} />
            <PaletteRow label="ثانوي" palette={accentPalette} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Section wrapper
// ============================================================
function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="text-right">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 justify-end">
            {title}
            {icon}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 leading-5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Toggle row
// ============================================================
function ToggleRow({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition">
      <Toggle checked={checked} onChange={onChange} />
      <div className="flex-1 text-right">
        <div className="text-sm font-bold text-slate-700">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

// ============================================================
// Shade strip (50–900)
// ============================================================
function ShadeStrip({ palette }: { palette: Record<string, string> }) {
  return (
    <div className="flex rounded-lg overflow-hidden ring-1 ring-slate-200">
      {SHADE_KEYS.map((shade) => (
        <div
          key={shade}
          className="flex-1 h-6 relative group"
          style={{ backgroundColor: `rgb(${palette[shade]})` }}
          title={shade}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition ${
              Number(shade) >= 500 ? "text-white" : "text-slate-700"
            }`}
          >
            {shade}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Palette row (legend with 3 swatches)
// ============================================================
function PaletteRow({
  label,
  palette,
}: {
  label: string;
  palette: Record<string, string>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {(["200", "400", "600", "800"] as const).map((s) => (
          <span
            key={s}
            className="w-5 h-5 rounded ring-1 ring-slate-200"
            style={{ backgroundColor: `rgb(${palette[s]})` }}
            title={s}
          />
        ))}
      </div>
      <span className="text-xs text-slate-600 font-bold">{label}</span>
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
  suggestedColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  suggestedColor?: string;
}) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value) || value === "";
  const swatch = isValid && value ? value : null;

  return (
    <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
      <div className="flex items-center justify-between mb-2">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-md px-2 py-1 transition"
          >
            إزالة
          </button>
        )}
        <label className="block text-xs font-bold text-slate-500 text-right flex items-center gap-1.5">
          {label}
          <Pipette className="w-3.5 h-3.5 text-slate-400" />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <input
            type="color"
            value={swatch ?? suggestedColor ?? "#1e9a8a"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="اختر لوناً"
          />
          <div
            className="w-11 h-11 rounded-lg border-2 border-slate-200 shadow-sm flex items-center justify-center"
            style={{
              backgroundColor: swatch ?? "transparent",
              backgroundImage: swatch
                ? undefined
                : "linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%), linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%)",
              backgroundSize: swatch ? undefined : "8px 8px",
              backgroundPosition: swatch ? undefined : "0 0, 4px 4px",
            }}
          >
            {!swatch && <Pipette className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v && !v.startsWith("#")) v = "#" + v;
            onChange(v);
          }}
          placeholder="#1e9a8a"
          dir="ltr"
          className={`flex-1 px-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-left font-mono focus:outline-none focus:ring-2 transition ${
            isValid
              ? "border-slate-200 focus:ring-brand-200 focus:bg-white"
              : "border-rose-300 focus:ring-rose-200 text-rose-700 bg-rose-50/50"
          }`}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        {!isValid && value ? (
          <p className="text-[11px] text-rose-600">صيغة غير صحيحة. مثال: #1e9a8a</p>
        ) : (
          <span />
        )}
        {hint && <p className="text-[11px] text-slate-400 text-right">{hint}</p>}
      </div>
    </div>
  );
}
