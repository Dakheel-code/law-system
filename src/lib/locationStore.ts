// Office locations store — CRUD + realtime + user assignments.
//
// Backed by:
//   public.office_locations   (id, name, address, lat, lng, radius_m, working_hours)
//   public.user_locations     (user_id, location_id)  -- M:N

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type WorkingHoursDay = {
  /** true → يوم إجازة، لا يوجد عمل */
  off: boolean;
  /** بداية الدوام HH:MM (24h) — مهمل إذا off=true */
  open?: string;
  /** نهاية الدوام HH:MM */
  close?: string;
};

/** أيام الأسبوع — اسم مختصر ثلاثي بالإنجليزية (sun..sat). */
export type WeekDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const weekDays: { key: WeekDay; label: string }[] = [
  { key: "sun", label: "الأحد" },
  { key: "mon", label: "الإثنين" },
  { key: "tue", label: "الثلاثاء" },
  { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
  { key: "sat", label: "السبت" },
];

export type WorkingHours = Partial<Record<WeekDay, WorkingHoursDay>>;

/** الإعداد الافتراضي: 5 أيام (أحد–خميس) 8:00–17:00، جمعة وسبت إجازة. */
export const defaultWorkingHours: WorkingHours = {
  sun: { off: false, open: "08:00", close: "17:00" },
  mon: { off: false, open: "08:00", close: "17:00" },
  tue: { off: false, open: "08:00", close: "17:00" },
  wed: { off: false, open: "08:00", close: "17:00" },
  thu: { off: false, open: "08:00", close: "17:00" },
  fri: { off: true },
  sat: { off: true },
};

export type OfficeLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  radiusM: number;
  workingHours: WorkingHours;
  active: boolean;
  createdAt: string;
};

type LocationRow = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_m: number | null;
  working_hours: WorkingHours | null;
  active: boolean | null;
  created_at: string;
};

const fromRow = (r: LocationRow): OfficeLocation => ({
  id: r.id,
  name: r.name,
  address: r.address ?? "",
  latitude: r.latitude,
  longitude: r.longitude,
  radiusM: r.radius_m ?? 100,
  workingHours:
    r.working_hours && typeof r.working_hours === "object"
      ? (r.working_hours as WorkingHours)
      : {},
  active: r.active ?? true,
  createdAt: r.created_at,
});

// ============================================================
// CRUD — office_locations
// ============================================================

export async function listLocations(): Promise<OfficeLocation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("office_locations")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listLocations", error);
    return [];
  }
  return (data as LocationRow[]).map(fromRow);
}

export type LocationInput = {
  name: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusM?: number;
  workingHours?: WorkingHours;
  active?: boolean;
};

export async function addLocation(
  input: LocationInput
): Promise<OfficeLocation | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("office_locations")
    .insert({
      name: input.name,
      address: input.address ?? "",
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      radius_m: input.radiusM ?? 100,
      working_hours: input.workingHours ?? defaultWorkingHours,
      active: input.active ?? true,
    })
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as LocationRow);
}

export async function updateLocation(
  id: string,
  patch: Partial<LocationInput>
): Promise<boolean> {
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.latitude !== undefined) row.latitude = patch.latitude;
  if (patch.longitude !== undefined) row.longitude = patch.longitude;
  if (patch.radiusM !== undefined) row.radius_m = patch.radiusM;
  if (patch.workingHours !== undefined) row.working_hours = patch.workingHours;
  if (patch.active !== undefined) row.active = patch.active;
  const { error } = await supabase
    .from("office_locations")
    .update(row)
    .eq("id", id);
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return false;
  }
  return true;
}

export async function deleteLocation(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("office_locations")
    .delete()
    .eq("id", id);
  return !error;
}

// ============================================================
// User ↔ Location assignments
// ============================================================

export type UserLocationLink = {
  userId: string;
  locationId: string;
};

export async function listUserLocations(): Promise<UserLocationLink[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_locations")
    .select("user_id,location_id");
  if (error) {
    console.error("listUserLocations", error);
    return [];
  }
  return (data as { user_id: string; location_id: string }[]).map((r) => ({
    userId: r.user_id,
    locationId: r.location_id,
  }));
}

export async function setUserLocations(
  userId: string,
  locationIds: string[]
): Promise<boolean> {
  if (!supabase) return false;
  // Delete existing then insert fresh — simple and idempotent.
  const { error: delErr } = await supabase
    .from("user_locations")
    .delete()
    .eq("user_id", userId);
  if (delErr) {
    alert(`فشل الحفظ: ${delErr.message}`);
    return false;
  }
  if (locationIds.length === 0) return true;
  const rows = locationIds.map((id) => ({
    user_id: userId,
    location_id: id,
  }));
  const { error: insErr } = await supabase.from("user_locations").insert(rows);
  if (insErr) {
    alert(`فشل الحفظ: ${insErr.message}`);
    return false;
  }
  return true;
}

// ============================================================
// Hooks
// ============================================================

export function useLocations() {
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listLocations();
    setLocations(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`locations-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "office_locations" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { locations, loading, refresh };
}

export function useUserLocations() {
  const [links, setLinks] = useState<UserLocationLink[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listUserLocations();
    setLinks(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`user-locations-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_locations" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  /** Returns the list of location IDs assigned to a given user. */
  const forUser = (userId: string) =>
    links.filter((l) => l.userId === userId).map((l) => l.locationId);

  /** Returns the list of user IDs assigned to a given location. */
  const usersAt = (locationId: string) =>
    links.filter((l) => l.locationId === locationId).map((l) => l.userId);

  return { links, loading, refresh, forUser, usersAt };
}

// ============================================================
// Geofence helpers
// ============================================================

/**
 * Haversine distance in meters between two lat/lng points.
 * Returns Infinity if either point is missing.
 */
export function distanceMeters(
  a: { latitude: number | null; longitude: number | null },
  b: { latitude: number | null; longitude: number | null }
): number {
  if (
    a.latitude == null ||
    a.longitude == null ||
    b.latitude == null ||
    b.longitude == null
  ) {
    return Infinity;
  }
  const R = 6371_000; // Earth radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** YYYY-MM-DD → WeekDay key. */
export function weekDayOf(d: Date): WeekDay {
  const days: WeekDay[] = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ];
  return days[d.getDay()];
}
