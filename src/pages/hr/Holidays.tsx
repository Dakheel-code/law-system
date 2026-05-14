// Holidays admin page (Phase 2 of Attendance system).
//
// Access: مدير only.

import { useMemo, useState } from "react";
import {
  CalendarOff,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Lock,
  Calendar,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";
import {
  useHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  holidayTypeLabels,
  type Holiday,
  type HolidayType,
} from "../../lib/holidayStore";
import { useLocations } from "../../lib/locationStore";
import { Field, Input, Textarea } from "../../components/ui/Field";
import InfoBanner from "../../components/ui/InfoBanner";

const fmtDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("ar-EG-u-nu-latn", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const typeChip: Record<HolidayType, string> = {
  official: "bg-rose-50 text-rose-700 border-rose-200",
  local: "bg-amber-50 text-amber-700 border-amber-200",
  custom: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function HolidaysPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { holidays, loading } = useHolidays();
  const { locations } = useLocations();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [filterYear, setFilterYear] = useState<number>(
    new Date().getFullYear()
  );

  const isManager = staff?.type === "manager";

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    holidays.forEach((h) => set.add(new Date(h.date).getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [holidays]);

  const visible = useMemo(
    () =>
      holidays.filter((h) => new Date(h.date).getFullYear() === filterYear),
    [holidays, filterYear]
  );

  if (!isManager) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700">ليس لديك صلاحية</h2>
        <p className="text-sm text-slate-500 mt-1">
          إدارة الإجازات الرسمية متاحة للمستخدمين من نوع "مدير" فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={CalendarOff}
        title="الإجازات الرسمية"
        description="أضف الإجازات الرسمية والمناسبات التي لا يوجد فيها عمل. ستظهر في تقويم الحضور ولن تُحتسب كأيام دوام."
      />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              إضافة إجازة
            </button>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">
            الإجازات ({visible.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center text-sm text-slate-400 py-10">
            جارٍ التحميل...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-300">
            <CalendarOff className="w-12 h-12 mb-3" strokeWidth={1.2} />
            <p className="text-sm font-bold text-slate-500 mb-1">
              لا توجد إجازات مسجَّلة لسنة {filterYear}
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
            >
              <Plus className="w-4 h-4" />
              إضافة الإجازة الأولى
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((h) => {
              const locNames =
                h.locationIds && h.locationIds.length > 0
                  ? locations
                      .filter((l) => h.locationIds!.includes(l.id))
                      .map((l) => l.name)
                  : null;
              return (
                <li
                  key={h.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setEditing(h)}
                        title="تعديل"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`حذف الإجازة "${h.name}"؟`)) return;
                          await deleteHoliday(h.id);
                        }}
                        title="حذف"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <h3 className="text-sm font-extrabold text-slate-800 truncate">
                        {h.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border mt-1 ${typeChip[h.type]}`}
                      >
                        {holidayTypeLabels[h.type]}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                      <CalendarOff className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-end gap-1.5 text-slate-700">
                      <span className="font-bold">{fmtDate(h.date)}</span>
                      <Calendar className="w-3 h-3 text-slate-400" />
                    </div>
                    {locNames && locNames.length > 0 && (
                      <div className="flex items-start justify-end gap-1.5 text-slate-600">
                        <span className="text-right">
                          {locNames.join("، ")}
                        </span>
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      </div>
                    )}
                    {(!locNames || locNames.length === 0) && (
                      <div className="text-[10px] text-emerald-600 font-bold text-right">
                        تنطبق على جميع المواقع
                      </div>
                    )}
                    {h.notes && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 text-right">
                        {h.notes}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(creating || editing) && (
        <HolidayFormModal
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Add/Edit modal
// ============================================================

function HolidayFormModal({
  initial,
  onClose,
}: {
  initial: Holiday | null;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const { locations } = useLocations();

  const [date, setDate] = useState(initial?.date ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<HolidayType>(initial?.type ?? "official");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [scope, setScope] = useState<"all" | "specific">(
    initial?.locationIds && initial.locationIds.length > 0 ? "specific" : "all"
  );
  const [locationIds, setLocationIds] = useState<Set<string>>(
    new Set(initial?.locationIds ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLocation = (id: string) => {
    setLocationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("اختر تاريخ الإجازة");
      return;
    }
    if (!name.trim()) {
      setError("أدخل اسم الإجازة");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      date,
      name: name.trim(),
      type,
      notes: notes.trim(),
      locationIds: scope === "all" ? null : [...locationIds],
    };
    const ok = isEdit
      ? await updateHoliday(initial!.id, payload)
      : !!(await addHoliday(payload));
    setSaving(false);
    if (ok) onClose();
    else setError("تعذّر الحفظ، حاول مرة أخرى");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-800">
              {isEdit ? "تعديل إجازة" : "إضافة إجازة جديدة"}
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="التاريخ *">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="نوع الإجازة">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HolidayType)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 text-right"
                >
                  <option value="official">رسمية</option>
                  <option value="local">محلية</option>
                  <option value="custom">خاصة</option>
                </select>
              </Field>
            </div>

            <Field label="اسم الإجازة *">
              <Input
                placeholder="مثال: اليوم الوطني السعودي"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="ملاحظات">
              <Textarea
                placeholder="أي تفاصيل إضافية..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            {/* Scope */}
            <div className="rounded-xl border border-slate-200 p-3 space-y-2">
              <h4 className="text-sm font-bold text-slate-700 text-right">
                نطاق التطبيق
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer text-xs font-bold transition border-slate-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === "all"}
                    onChange={() => setScope("all")}
                    className="accent-brand-500"
                  />
                  جميع المواقع
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer text-xs font-bold transition border-slate-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === "specific"}
                    onChange={() => setScope("specific")}
                    className="accent-brand-500"
                  />
                  مواقع محددة
                </label>
              </div>

              {scope === "specific" && (
                <div className="mt-2 space-y-1.5">
                  {locations.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-3">
                      لا توجد مواقع — أضف موقعاً أولاً
                    </div>
                  ) : (
                    locations.map((l) => (
                      <label
                        key={l.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={locationIds.has(l.id)}
                          onChange={() => toggleLocation(l.id)}
                          className="w-4 h-4 rounded accent-brand-500"
                        />
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="flex-1 text-right font-bold text-slate-700">
                          {l.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 text-right">
                {error}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الإجازة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
