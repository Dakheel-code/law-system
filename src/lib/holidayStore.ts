// Holidays store — CRUD + realtime + helpers for "is this a working day?"
//
// Backed by:
//   public.holidays (id, date, name, type, notes, location_ids[])

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { weekDayOf, type OfficeLocation } from "./locationStore";

export type HolidayType = "ramadan" | "eid" | "private" | "national";

export const holidayTypeLabels: Record<HolidayType, string> = {
  ramadan: "رمضان",
  eid: "أعياد",
  private: "إجازة خاصة",
  national: "إجازة وطنية",
};

export type Holiday = {
  id: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD (= startDate if single day)
  name: string;
  type: HolidayType;
  notes: string;
  /** null = applies to all locations. Otherwise restricted to these IDs. */
  locationIds: string[] | null;
  createdAt: string;
};

type HolidayRow = {
  id: string;
  start_date: string;
  end_date: string;
  name: string;
  type: string | null;
  notes: string | null;
  location_ids: string[] | null;
  created_at: string;
};

const fromRow = (r: HolidayRow): Holiday => ({
  id: r.id,
  startDate: r.start_date,
  endDate: r.end_date ?? r.start_date,
  name: r.name,
  type: (r.type as HolidayType) ?? "national",
  notes: r.notes ?? "",
  locationIds: r.location_ids,
  createdAt: r.created_at,
});

// ============================================================
// CRUD
// ============================================================

export async function listHolidays(): Promise<Holiday[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) {
    console.error("listHolidays", error);
    return [];
  }
  return (data as HolidayRow[]).map(fromRow);
}

export type HolidayInput = {
  startDate: string;
  endDate: string;
  name: string;
  type?: HolidayType;
  notes?: string;
  locationIds?: string[] | null;
};

export async function addHoliday(
  input: HolidayInput
): Promise<Holiday | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("holidays")
    .insert({
      start_date: input.startDate,
      end_date: input.endDate,
      name: input.name,
      type: input.type ?? "national",
      notes: input.notes ?? "",
      location_ids: input.locationIds && input.locationIds.length > 0
        ? input.locationIds
        : null,
    })
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as HolidayRow);
}

export async function updateHoliday(
  id: string,
  patch: Partial<HolidayInput>
): Promise<boolean> {
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.locationIds !== undefined) {
    row.location_ids =
      patch.locationIds && patch.locationIds.length > 0
        ? patch.locationIds
        : null;
  }
  const { error } = await supabase.from("holidays").update(row).eq("id", id);
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return false;
  }
  return true;
}

export async function deleteHoliday(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("holidays").delete().eq("id", id);
  return !error;
}

// ============================================================
// Hook
// ============================================================

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listHolidays();
    setHolidays(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`holidays-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holidays" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  // Quick lookup by date string — a multi-day holiday adds an entry on
  // every YYYY-MM-DD it covers.
  const byDate = useMemo(() => {
    const m = new Map<string, Holiday[]>();
    holidays.forEach((h) => {
      const start = new Date(h.startDate + "T00:00:00");
      const end = new Date(h.endDate + "T00:00:00");
      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        const arr = m.get(iso) ?? [];
        arr.push(h);
        m.set(iso, arr);
      }
    });
    return m;
  }, [holidays]);

  return { holidays, loading, refresh, byDate };
}

// ============================================================
// Working-day helpers
// ============================================================

export type DayStatus =
  | { kind: "off"; reason: "weekly" | "holiday"; holiday?: Holiday }
  | { kind: "work"; open: string; close: string };

/**
 * Determine whether a given date is a working day at a given location.
 *
 *   - Checks the location's `workingHours[weekDay]` → if `off: true` returns weekly off.
 *   - Checks the `holidays` list → if any holiday matches the date AND applies
 *     to this location (or applies globally) returns holiday off.
 *   - Otherwise returns `work` with open/close times.
 */
export function getDayStatus(
  date: Date,
  location: OfficeLocation,
  holidays: Holiday[]
): DayStatus {
  const isoDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Holiday check first (overrides working hours) — supports date ranges
  const dayHolidays = holidays.filter(
    (h) =>
      isoDate >= h.startDate &&
      isoDate <= h.endDate &&
      (!h.locationIds ||
        h.locationIds.length === 0 ||
        h.locationIds.includes(location.id))
  );
  if (dayHolidays.length > 0) {
    return { kind: "off", reason: "holiday", holiday: dayHolidays[0] };
  }

  // Weekly schedule check
  const weekDay = weekDayOf(date);
  const dayHours = location.workingHours[weekDay];
  if (!dayHours || dayHours.off) {
    return { kind: "off", reason: "weekly" };
  }

  return {
    kind: "work",
    open: dayHours.open ?? "08:00",
    close: dayHours.close ?? "17:00",
  };
}
