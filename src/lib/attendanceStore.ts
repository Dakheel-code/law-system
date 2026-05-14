// Attendance store — check-in / check-out with GPS validation.
//
// Backed by:
//   public.attendance_records (user_id, location_id, date, check_in_at, ...)

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { toLocalISO } from "./hijri";
import {
  distanceMeters,
  type OfficeLocation,
} from "./locationStore";
import { getDayStatus, type Holiday } from "./holidayStore";

export type AttendanceStatus = "present" | "late" | "left-early";

export type AttendanceRecord = {
  id: string;
  userId: string;
  locationId: string;
  date: string;                   // YYYY-MM-DD
  checkInAt: string;              // ISO timestamp
  checkInLat: number | null;
  checkInLng: number | null;
  checkInDistanceM: number | null;
  checkOutAt: string | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  checkOutDistanceM: number | null;
  status: AttendanceStatus;
  notes: string;
  createdAt: string;
};

type AttendanceRow = {
  id: string;
  user_id: string;
  location_id: string;
  date: string;
  check_in_at: string;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_in_distance_m: number | null;
  check_out_at: string | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_out_distance_m: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const fromRow = (r: AttendanceRow): AttendanceRecord => ({
  id: r.id,
  userId: r.user_id,
  locationId: r.location_id,
  date: r.date,
  checkInAt: r.check_in_at,
  checkInLat: r.check_in_lat,
  checkInLng: r.check_in_lng,
  checkInDistanceM: r.check_in_distance_m,
  checkOutAt: r.check_out_at,
  checkOutLat: r.check_out_lat,
  checkOutLng: r.check_out_lng,
  checkOutDistanceM: r.check_out_distance_m,
  status: (r.status as AttendanceStatus) ?? "present",
  notes: r.notes ?? "",
  createdAt: r.created_at,
});

// ============================================================
// Queries
// ============================================================

export async function listMyAttendance(
  userId: string,
  fromDate?: string,
  toDate?: string
): Promise<AttendanceRecord[]> {
  if (!supabase) return [];
  let q = supabase
    .from("attendance_records")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (fromDate) q = q.gte("date", fromDate);
  if (toDate) q = q.lte("date", toDate);
  const { data, error } = await q;
  if (error) {
    console.error("listMyAttendance", error);
    return [];
  }
  return (data as AttendanceRow[]).map(fromRow);
}

export async function listAllAttendance(
  fromDate?: string,
  toDate?: string
): Promise<AttendanceRecord[]> {
  if (!supabase) return [];
  let q = supabase
    .from("attendance_records")
    .select("*")
    .order("date", { ascending: false })
    .order("check_in_at", { ascending: false });
  if (fromDate) q = q.gte("date", fromDate);
  if (toDate) q = q.lte("date", toDate);
  const { data, error } = await q;
  if (error) {
    console.error("listAllAttendance", error);
    return [];
  }
  return (data as AttendanceRow[]).map(fromRow);
}

export async function getTodayRecord(
  userId: string
): Promise<AttendanceRecord | null> {
  if (!supabase) return null;
  const today = toLocalISO(new Date());
  const { data } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();
  return data ? fromRow(data as AttendanceRow) : null;
}

// ============================================================
// GPS-validated check-in / check-out
// ============================================================

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

/** Wraps navigator.geolocation in a promise. */
export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("المتصفح لا يدعم GPS"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "تم رفض إذن الوصول للموقع — فعّله من إعدادات المتصفح"
            : err.code === err.POSITION_UNAVAILABLE
            ? "تعذّر تحديد الموقع — تحقق من تشغيل GPS"
            : err.code === err.TIMEOUT
            ? "انتهت مهلة تحديد الموقع — حاول مجدداً"
            : "تعذّر الحصول على الموقع";
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  });
}

/**
 * Find the FIRST user-assigned location within geofence radius from the
 * given position. Returns null if none match.
 */
export function findMatchingLocation(
  position: GeoPosition,
  myLocations: OfficeLocation[]
): {
  location: OfficeLocation;
  distanceM: number;
} | null {
  for (const loc of myLocations) {
    if (!loc.active || loc.latitude == null || loc.longitude == null) continue;
    const d = distanceMeters(
      { latitude: position.latitude, longitude: position.longitude },
      { latitude: loc.latitude, longitude: loc.longitude }
    );
    if (d <= loc.radiusM) {
      return { location: loc, distanceM: Math.round(d) };
    }
  }
  return null;
}

/**
 * Returns the NEAREST user-assigned location regardless of geofence — used
 * for showing "you are N meters away from <office>" hints to the user.
 */
export function findNearestLocation(
  position: GeoPosition,
  myLocations: OfficeLocation[]
): {
  location: OfficeLocation;
  distanceM: number;
} | null {
  let best: { location: OfficeLocation; distanceM: number } | null = null;
  for (const loc of myLocations) {
    if (!loc.active || loc.latitude == null || loc.longitude == null) continue;
    const d = distanceMeters(
      { latitude: position.latitude, longitude: position.longitude },
      { latitude: loc.latitude, longitude: loc.longitude }
    );
    if (!best || d < best.distanceM) {
      best = { location: loc, distanceM: Math.round(d) };
    }
  }
  return best;
}

export type CheckInResult =
  | { ok: true; record: AttendanceRecord }
  | { ok: false; error: string };

/**
 * Attempt to check in the current user from their device location.
 *
 * Validates:
 *   - User has at least one assigned location
 *   - Position is within radius of one of them
 *   - Today is not a holiday/weekly-off at that location
 *   - No existing check-in for today
 */
export async function checkIn(params: {
  userId: string;
  myLocations: OfficeLocation[];
  holidays: Holiday[];
  /** Pass the position upfront if you already got it; otherwise we fetch. */
  position?: GeoPosition;
}): Promise<CheckInResult> {
  if (!supabase) return { ok: false, error: "قاعدة البيانات غير متصلة" };

  const { userId, myLocations, holidays } = params;
  if (myLocations.length === 0) {
    return { ok: false, error: "لم يتم تعيين موقع لك بعد — اتصل بالمدير" };
  }

  let position = params.position;
  if (!position) {
    try {
      position = await getCurrentPosition();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  const match = findMatchingLocation(position, myLocations);
  if (!match) {
    const nearest = findNearestLocation(position, myLocations);
    if (nearest) {
      return {
        ok: false,
        error: `أنت خارج نطاق المكتب — تبعد عن "${nearest.location.name}" بمقدار ${nearest.distanceM}م (المسموح: ${nearest.location.radiusM}م)`,
      };
    }
    return { ok: false, error: "خارج نطاق أي مكتب مسموح" };
  }

  // Holiday / weekly off check
  const status = getDayStatus(new Date(), match.location, holidays);
  if (status.kind === "off") {
    if (status.reason === "holiday") {
      return {
        ok: false,
        error: `اليوم إجازة رسمية: ${status.holiday?.name ?? ""}`,
      };
    }
    return { ok: false, error: "اليوم إجازة أسبوعية ولا يوجد دوام" };
  }

  // Check existing record
  const existing = await getTodayRecord(userId);
  if (existing) {
    return { ok: false, error: "تم تسجيل حضورك اليوم مسبقاً" };
  }

  // Derive late status
  const now = new Date();
  const [openH, openM] = status.open.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isLate = nowMinutes > openMinutes + 15; // 15-minute grace

  const today = toLocalISO(now);
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      user_id: userId,
      location_id: match.location.id,
      date: today,
      check_in_at: now.toISOString(),
      check_in_lat: position.latitude,
      check_in_lng: position.longitude,
      check_in_distance_m: match.distanceM,
      status: isLate ? "late" : "present",
    })
    .select()
    .single();
  if (error) {
    return { ok: false, error: `فشل الحفظ: ${error.message}` };
  }
  return { ok: true, record: fromRow(data as AttendanceRow) };
}

/**
 * Check out — finalizes today's record.
 */
export async function checkOut(params: {
  userId: string;
  myLocations: OfficeLocation[];
  position?: GeoPosition;
}): Promise<CheckInResult> {
  if (!supabase) return { ok: false, error: "قاعدة البيانات غير متصلة" };

  const { userId, myLocations } = params;
  const existing = await getTodayRecord(userId);
  if (!existing) {
    return { ok: false, error: "لم تسجّل حضورك اليوم — لا يمكن تسجيل انصراف" };
  }
  if (existing.checkOutAt) {
    return { ok: false, error: "تم تسجيل الانصراف مسبقاً" };
  }

  let position = params.position;
  if (!position) {
    try {
      position = await getCurrentPosition();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // Check-out geofence — use the same location they checked in at
  const checkInLocation = myLocations.find(
    (l) => l.id === existing.locationId
  );
  let distance: number | null = null;
  if (
    checkInLocation &&
    checkInLocation.latitude != null &&
    checkInLocation.longitude != null
  ) {
    distance = Math.round(
      distanceMeters(
        { latitude: position.latitude, longitude: position.longitude },
        {
          latitude: checkInLocation.latitude,
          longitude: checkInLocation.longitude,
        }
      )
    );
    if (distance > checkInLocation.radiusM) {
      return {
        ok: false,
        error: `أنت خارج نطاق المكتب — تبعد ${distance}م (المسموح: ${checkInLocation.radiusM}م)`,
      };
    }
  }

  const now = new Date();
  const { data, error } = await supabase
    .from("attendance_records")
    .update({
      check_out_at: now.toISOString(),
      check_out_lat: position.latitude,
      check_out_lng: position.longitude,
      check_out_distance_m: distance,
    })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) {
    return { ok: false, error: `فشل الحفظ: ${error.message}` };
  }
  return { ok: true, record: fromRow(data as AttendanceRow) };
}

// ============================================================
// Hooks
// ============================================================

export function useMyAttendance(userId: string | null | undefined) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    const list = await listMyAttendance(userId);
    setRecords(list);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    const sb = supabase;
    if (!sb || !userId) return;
    const channel = sb
      .channel(`my-attendance-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_records",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const today = useMemo(() => {
    if (!records.length) return null;
    const t = toLocalISO(new Date());
    return records.find((r) => r.date === t) ?? null;
  }, [records]);

  return { records, today, loading, refresh };
}

export function useAllAttendance(fromDate?: string, toDate?: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listAllAttendance(fromDate, toDate);
    setRecords(list);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`all-attendance-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_records" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  return { records, loading, refresh };
}
