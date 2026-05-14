// Locations admin page (Phase 1 of Attendance system).
//
// Access: مدير only — non-managers see "ليس لديك صلاحية".
// Features:
//   • List all office locations
//   • Add/edit/delete a location
//   • Set GPS coordinates (use current device location or enter manually)
//   • Set geofence radius (meters)
//   • Set working hours per day of week
//   • Assign users to a location

import { useState } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Edit3,
  Trash2,
  Users as UsersIcon,
  Crosshair,
  Save,
  X,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";
import { useUsers } from "../../lib/userStore";
import {
  useLocations,
  useUserLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setUserLocations,
  defaultWorkingHours,
  weekDays,
  type OfficeLocation,
  type WorkingHours,
  type WeekDay,
} from "../../lib/locationStore";
import { Field, Input } from "../../components/ui/Field";
import InfoBanner from "../../components/ui/InfoBanner";

export default function LocationsPage() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { locations, loading } = useLocations();
  const [editing, setEditing] = useState<OfficeLocation | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<OfficeLocation | null>(null);

  const isManager = staff?.type === "manager";

  if (!isManager) {
    return (
      <div className="card p-12 flex flex-col items-center text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-700">ليس لديك صلاحية</h2>
        <p className="text-sm text-slate-500 mt-1">
          إدارة المواقع متاحة للمستخدمين من نوع "مدير" فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Building2}
        title="مواقع المكاتب"
        description="أضف مواقع المكتب الجغرافية وحدّد لكل موقع نطاق المسافة وأوقات العمل والمستخدمين المرتبطين به."
      />

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-extrabold text-slate-800">
            المواقع ({locations.length})
          </h2>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
          >
            <Plus className="w-4 h-4" />
            إضافة موقع
          </button>
        </div>

        {loading ? (
          <div className="text-center text-sm text-slate-400 py-10">
            جارٍ التحميل...
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-slate-300">
            <Building2 className="w-12 h-12 mb-3" strokeWidth={1.2} />
            <p className="text-sm font-bold text-slate-500 mb-1">
              لا توجد مواقع بعد
            </p>
            <p className="text-xs text-slate-400 mb-4">
              أضف موقع المكتب الأول لتفعيل ميزة الحضور والانصراف
            </p>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold hover:bg-brand-50"
            >
              <Plus className="w-4 h-4" />
              إضافة الموقع الأول
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((l) => (
              <LocationCard
                key={l.id}
                location={l}
                onEdit={() => setEditing(l)}
                onDelete={async () => {
                  if (
                    !confirm(
                      `حذف الموقع "${l.name}"؟\n\nسيُحذف ربط المستخدمين به أيضاً.`
                    )
                  )
                    return;
                  await deleteLocation(l.id);
                }}
                onAssign={() => setAssigning(l)}
              />
            ))}
          </ul>
        )}
      </div>

      {(creating || editing) && (
        <LocationFormModal
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {assigning && (
        <AssignUsersModal
          location={assigning}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Location card
// ============================================================

function LocationCard({
  location: l,
  onEdit,
  onDelete,
  onAssign,
}: {
  location: OfficeLocation;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}) {
  const { usersAt } = useUserLocations();
  const userCount = usersAt(l.id).length;
  const hasCoords = l.latitude != null && l.longitude != null;
  const workingDays = (Object.entries(l.workingHours) as [WeekDay, { off: boolean }][])
    .filter(([, h]) => !h.off).length;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-0.5">
          <button
            onClick={onEdit}
            title="تعديل"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="حذف"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 min-w-0 text-right">
          <h3 className="text-sm font-extrabold text-slate-800 truncate">
            {l.name}
          </h3>
          {l.address && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {l.address}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span
            className={`font-mono ${
              hasCoords ? "text-emerald-700" : "text-rose-500"
            }`}
            dir="ltr"
          >
            {hasCoords
              ? `${l.latitude!.toFixed(5)}, ${l.longitude!.toFixed(5)}`
              : "غير محدّد"}
          </span>
          <span className="text-slate-500 inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            الإحداثيات
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-slate-700" dir="ltr">
            {l.radiusM} م
          </span>
          <span className="text-slate-500 inline-flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            نطاق GPS
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-700 font-bold">{workingDays} أيام</span>
          <span className="text-slate-500">أيام العمل</span>
        </div>
      </div>

      <button
        onClick={onAssign}
        className="w-full mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-200 rounded-lg text-xs font-bold transition"
      >
        <UsersIcon className="w-3.5 h-3.5" />
        المستخدمون ({userCount})
      </button>
    </li>
  );
}

// ============================================================
// Add/Edit modal
// ============================================================

function LocationFormModal({
  initial,
  onClose,
}: {
  initial: OfficeLocation | null;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [latitude, setLatitude] = useState<string>(
    initial?.latitude?.toString() ?? ""
  );
  const [longitude, setLongitude] = useState<string>(
    initial?.longitude?.toString() ?? ""
  );
  const [radiusM, setRadiusM] = useState(initial?.radiusM ?? 100);
  const [hours, setHours] = useState<WorkingHours>(
    initial?.workingHours && Object.keys(initial.workingHours).length > 0
      ? initial.workingHours
      : defaultWorkingHours
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم GPS");
      return;
    }
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "تم رفض إذن الوصول للموقع"
            : "تعذّر الحصول على الموقع"
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("أدخل اسم الموقع");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: name.trim(),
      address: address.trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      radiusM: Math.max(10, Number(radiusM) || 100),
      workingHours: hours,
      active: true,
    };
    const ok = isEdit
      ? await updateLocation(initial!.id, payload)
      : !!(await addLocation(payload));
    setSaving(false);
    if (ok) onClose();
    else setError("تعذّر الحفظ، حاول مرة أخرى");
  };

  const updateDay = (key: WeekDay, patch: Partial<WorkingHours[WeekDay]>) => {
    setHours((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { off: false }), ...patch } as WorkingHours[WeekDay],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
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
              {isEdit ? "تعديل موقع" : "إضافة موقع جديد"}
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <Field label="اسم الموقع *">
              <Input
                placeholder="مثال: المكتب الرئيسي - الرياض"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="العنوان">
              <Input
                placeholder="مثال: حي الملقا، شارع الأمير محمد"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>

            {/* GPS */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md text-xs font-bold disabled:opacity-60"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {gpsLoading ? "جارٍ التحديد..." : "استخدم موقعي الحالي"}
                </button>
                <h4 className="text-sm font-bold text-slate-700 inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  إحداثيات GPS
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="خط العرض (Latitude)">
                  <Input
                    type="number"
                    step="any"
                    placeholder="24.7136"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    dir="ltr"
                    className="text-left font-mono"
                  />
                </Field>
                <Field label="خط الطول (Longitude)">
                  <Input
                    type="number"
                    step="any"
                    placeholder="46.6753"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    dir="ltr"
                    className="text-left font-mono"
                  />
                </Field>
                <Field label="نطاق المسافة (متر)">
                  <Input
                    type="number"
                    min={10}
                    step={5}
                    placeholder="100"
                    value={radiusM}
                    onChange={(e) => setRadiusM(Number(e.target.value) || 100)}
                    dir="ltr"
                    className="text-left"
                  />
                </Field>
              </div>
            </div>

            {/* Working hours */}
            <div className="rounded-xl border border-slate-200 p-3 space-y-2">
              <h4 className="text-sm font-bold text-slate-700 mb-2">
                أوقات العمل
              </h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-right py-1.5 pr-1 font-bold">اليوم</th>
                    <th className="text-center py-1.5 font-bold">إجازة</th>
                    <th className="text-center py-1.5 font-bold">من</th>
                    <th className="text-center py-1.5 font-bold">إلى</th>
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day) => {
                    const h = hours[day.key] ?? { off: false };
                    return (
                      <tr key={day.key} className="border-t border-slate-100">
                        <td className="py-2 pr-1 font-bold text-slate-700">
                          {day.label}
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!h.off}
                            onChange={(e) =>
                              updateDay(day.key, { off: e.target.checked })
                            }
                            className="w-4 h-4 rounded accent-brand-500"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="time"
                            value={h.open ?? "08:00"}
                            onChange={(e) =>
                              updateDay(day.key, { open: e.target.value })
                            }
                            disabled={!!h.off}
                            dir="ltr"
                            className="w-full text-center text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 disabled:opacity-50 font-mono"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="time"
                            value={h.close ?? "17:00"}
                            onChange={(e) =>
                              updateDay(day.key, { close: e.target.value })
                            }
                            disabled={!!h.off}
                            dir="ltr"
                            className="w-full text-center text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 disabled:opacity-50 font-mono"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الموقع"}
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

// ============================================================
// Assign users modal
// ============================================================

function AssignUsersModal({
  location,
  onClose,
}: {
  location: OfficeLocation;
  onClose: () => void;
}) {
  const { users } = useUsers();
  const { usersAt, refresh } = useUserLocations();
  const initial = usersAt(location.id);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const activeUsers = users.filter((u) => u.status === "active");
  const filtered = search.trim()
    ? activeUsers.filter((u) =>
        (u.fullName + " " + u.code + " " + u.email)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : activeUsers;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // For each user in the system, set their assignment to either include
    // this location or exclude it — based on the new selection.
    const toAdd = [...selected].filter((id) => !initial.includes(id));
    const toRemove = initial.filter((id) => !selected.has(id));

    // For each user we need to read their existing assignments, modify the
    // set for THIS location, and write back. We use setUserLocations which
    // does a delete+insert of all the user's links — so we must preserve
    // the user's other location links.
    const allLinks = await (async () => {
      const { listUserLocations } = await import("../../lib/locationStore");
      return listUserLocations();
    })();

    const linksByUser = new Map<string, string[]>();
    allLinks.forEach((link) => {
      const arr = linksByUser.get(link.userId) ?? [];
      arr.push(link.locationId);
      linksByUser.set(link.userId, arr);
    });

    for (const userId of toAdd) {
      const existing = linksByUser.get(userId) ?? [];
      if (!existing.includes(location.id))
        await setUserLocations(userId, [...existing, location.id]);
    }
    for (const userId of toRemove) {
      const existing = linksByUser.get(userId) ?? [];
      await setUserLocations(
        userId,
        existing.filter((id) => id !== location.id)
      );
    }
    await refresh();
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h2 className="text-lg font-extrabold text-slate-800">
              مستخدمو الموقع
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{location.name}</p>
          </div>
        </div>

        <div className="p-5">
          <Input
            placeholder="ابحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ul className="mt-3 max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {filtered.length === 0 ? (
              <li className="text-center text-xs text-slate-400 py-6">
                لا يوجد مستخدمون مطابقون
              </li>
            ) : (
              filtered.map((u) => {
                const sel = selected.has(u.id);
                return (
                  <li key={u.id}>
                    <label className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggle(u.id)}
                        className="w-4 h-4 rounded accent-brand-500"
                      />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-sm font-bold text-slate-700 truncate">
                          {u.fullName || u.code}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {u.type} · {u.email || u.code}
                        </div>
                      </div>
                      {u.avatarDataUrl ? (
                        <img
                          src={u.avatarDataUrl}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.firstName?.[0] || u.fullName?.[0] || "؟").toUpperCase()}
                        </div>
                      )}
                    </label>
                  </li>
                );
              })
            )}
          </ul>

          <div className="text-[11px] text-slate-500 text-right mt-2">
            {selected.size} مختار من <bdi dir="ltr">{activeUsers.length}</bdi>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
