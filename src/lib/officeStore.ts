import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// ============================================================
// Types
// ============================================================

export type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  push: boolean;
  sessions: boolean;
  deadlines: boolean;
  payments: boolean;
  newRequests: boolean;
  weekly: boolean;
};

export const defaultNotifications: NotificationPrefs = {
  email: true,
  sms: false,
  push: true,
  sessions: true,
  deadlines: true,
  payments: true,
  newRequests: true,
  weekly: false,
};

export type CaseOption = { value: string; label: string };

export type OfficeInfo = {
  id: string;
  // contact
  officeName: string;
  shortName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  crNumber: string;
  taxNumber: string;
  // general
  language: string;
  timezone: string;
  currency: string;
  calendarFormat: string;
  dateFormat: string;
  // notifications
  notifications: NotificationPrefs;
  // backup
  backupAuto: boolean;
  lastBackupAt: string | null;
  // form customization
  caseTypes: CaseOption[];
  courtTypes: CaseOption[];
};

type OfficeRow = {
  id: string;
  office_name: string | null;
  short_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  cr_number: string | null;
  tax_number: string | null;
  language: string | null;
  timezone: string | null;
  currency: string | null;
  calendar_format: string | null;
  date_format: string | null;
  notifications: Partial<NotificationPrefs> | null;
  backup_auto: boolean | null;
  last_backup_at: string | null;
  case_types: CaseOption[] | null;
  court_types: CaseOption[] | null;
};

const DEFAULT_CASE_TYPES: CaseOption[] = [
  { value: "commercial", label: "تجارية" },
  { value: "labor", label: "عمالية" },
  { value: "real-estate", label: "عقارية" },
  { value: "personal-status", label: "أحوال شخصية" },
  { value: "criminal", label: "جزائية" },
  { value: "administrative", label: "إدارية" },
  { value: "execution", label: "تنفيذية" },
  { value: "civil", label: "حقوقية" },
];

const DEFAULT_COURT_TYPES: CaseOption[] = [
  { value: "general", label: "المحكمة العامة" },
  { value: "commercial", label: "المحكمة التجارية" },
  { value: "labor", label: "المحكمة العمالية" },
  { value: "personal-status", label: "محكمة الأحوال الشخصية" },
  { value: "criminal", label: "المحكمة الجزائية" },
  { value: "administrative", label: "ديوان المظالم" },
  { value: "execution", label: "محكمة التنفيذ" },
  { value: "appeal", label: "محكمة الاستئناف" },
  { value: "supreme", label: "المحكمة العليا" },
];

export { DEFAULT_CASE_TYPES, DEFAULT_COURT_TYPES };

const fromRow = (row: OfficeRow): OfficeInfo => ({
  id: row.id,
  officeName: row.office_name ?? "",
  shortName: row.short_name ?? "",
  phone: row.phone ?? "",
  email: row.email ?? "",
  website: row.website ?? "",
  address: row.address ?? "",
  crNumber: row.cr_number ?? "",
  taxNumber: row.tax_number ?? "",
  language: row.language ?? "ar",
  timezone: row.timezone ?? "asia-riyadh",
  currency: row.currency ?? "sar",
  calendarFormat: row.calendar_format ?? "both",
  dateFormat: row.date_format ?? "dmy",
  notifications: { ...defaultNotifications, ...(row.notifications ?? {}) },
  backupAuto: row.backup_auto ?? true,
  lastBackupAt: row.last_backup_at,
  caseTypes: Array.isArray(row.case_types) && row.case_types.length > 0 ? row.case_types : DEFAULT_CASE_TYPES,
  courtTypes: Array.isArray(row.court_types) && row.court_types.length > 0 ? row.court_types : DEFAULT_COURT_TYPES,
});

const toUpdate = (patch: Partial<OfficeInfo>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (patch.officeName !== undefined) out.office_name = patch.officeName;
  if (patch.shortName !== undefined) out.short_name = patch.shortName;
  if (patch.phone !== undefined) out.phone = patch.phone;
  if (patch.email !== undefined) out.email = patch.email;
  if (patch.website !== undefined) out.website = patch.website;
  if (patch.address !== undefined) out.address = patch.address;
  if (patch.crNumber !== undefined) out.cr_number = patch.crNumber;
  if (patch.taxNumber !== undefined) out.tax_number = patch.taxNumber;
  if (patch.language !== undefined) out.language = patch.language;
  if (patch.timezone !== undefined) out.timezone = patch.timezone;
  if (patch.currency !== undefined) out.currency = patch.currency;
  if (patch.calendarFormat !== undefined) out.calendar_format = patch.calendarFormat;
  if (patch.dateFormat !== undefined) out.date_format = patch.dateFormat;
  if (patch.notifications !== undefined) out.notifications = patch.notifications;
  if (patch.backupAuto !== undefined) out.backup_auto = patch.backupAuto;
  if (patch.lastBackupAt !== undefined) out.last_backup_at = patch.lastBackupAt;
  if (patch.caseTypes !== undefined) out.case_types = patch.caseTypes;
  if (patch.courtTypes !== undefined) out.court_types = patch.courtTypes;
  return out;
};

// ============================================================
// Public API
// ============================================================

export const defaultOffice: OfficeInfo = {
  id: "",
  officeName: "شركة ناصر طريد للمحاماة",
  shortName: "ناصر طريد",
  phone: "",
  email: "",
  website: "",
  address: "",
  crNumber: "",
  taxNumber: "",
  language: "ar",
  timezone: "asia-riyadh",
  currency: "sar",
  calendarFormat: "both",
  dateFormat: "dmy",
  notifications: { ...defaultNotifications },
  backupAuto: true,
  lastBackupAt: null,
  caseTypes: DEFAULT_CASE_TYPES,
  courtTypes: DEFAULT_COURT_TYPES,
};

export async function getOffice(): Promise<OfficeInfo | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("office_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getOffice", error);
    return null;
  }
  return fromRow(data as OfficeRow);
}

export async function updateOffice(
  id: string,
  patch: Partial<OfficeInfo>
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("office_settings")
    .update(toUpdate(patch))
    .eq("id", id);
  if (error) {
    console.error("updateOffice", error);
    alert(`فشل الحفظ: ${error.message}`);
    return false;
  }
  return true;
}

// ============================================================
// React hook
// ============================================================

export function useOffice() {
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const o = await getOffice();
    setOffice(o ?? defaultOffice);
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`office-info-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "office_settings" },
        () => refresh()
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { office, loading, refresh, isConfigured: !!supabase };
}

// ============================================================
// Activity log
// ============================================================

export type ActivityRecord = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  category: string | null;
  description: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
};

type ActivityRow = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  category: string | null;
  description: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

const fromActivityRow = (row: ActivityRow): ActivityRecord => ({
  id: row.id,
  actorId: row.actor_id,
  actorName: row.actor_name,
  action: row.action,
  category: row.category,
  description: row.description,
  meta: row.meta ?? {},
  createdAt: row.created_at,
});

export async function logActivity(input: {
  action: string;
  category?: string;
  description?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const actorName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    null;
  await supabase.from("activity_log").insert({
    actor_id: user?.id ?? null,
    actor_name: actorName,
    action: input.action,
    category: input.category ?? null,
    description: input.description ?? null,
    meta: input.meta ?? {},
  });
}

export async function listActivities(limit = 100): Promise<ActivityRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("listActivities", error);
    return [];
  }
  return (data as ActivityRow[]).map(fromActivityRow);
}

export async function clearActivities(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("activity_log")
    .delete()
    .gte("created_at", "1970-01-01");
  if (error) {
    console.error("clearActivities", error);
    alert(`فشل المسح: ${error.message}`);
    return false;
  }
  return true;
}

export function useActivities(limit = 100) {
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listActivities(limit);
    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`activity-log-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { items, loading, refresh };
}

// ============================================================
// Backup / Restore
// ============================================================

const BACKUP_TABLES = [
  "office_settings",
  "clients",
  "cases",
  "tasks",
  "contracts",
  "staff",
  "profiles",
] as const;

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  tables: Record<string, unknown[]>;
};

export async function createBackup(): Promise<BackupPayload | null> {
  if (!supabase) return null;
  const tables: Record<string, unknown[]> = {};
  for (const t of BACKUP_TABLES) {
    const { data, error } = await supabase.from(t).select("*");
    if (error) {
      console.warn(`backup ${t}`, error.message);
      tables[t] = [];
    } else {
      tables[t] = data ?? [];
    }
  }
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables,
  };
  return payload;
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  a.download = `law-system-backup-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function restoreBackup(payload: BackupPayload): Promise<{
  ok: boolean;
  inserted: Record<string, number>;
  errors: string[];
}> {
  const inserted: Record<string, number> = {};
  const errors: string[] = [];
  if (!supabase) return { ok: false, inserted, errors: ["Supabase غير مهيأ"] };
  if (!payload || payload.version !== 1 || !payload.tables) {
    return { ok: false, inserted, errors: ["تنسيق ملف النسخة الاحتياطية غير صحيح"] };
  }
  // Insert in dependency order; ignore conflicts (upsert by primary key)
  const order = [
    "office_settings",
    "profiles",
    "staff",
    "clients",
    "cases",
    "contracts",
    "tasks",
  ];
  for (const t of order) {
    const rows = payload.tables[t];
    if (!Array.isArray(rows) || rows.length === 0) {
      inserted[t] = 0;
      continue;
    }
    const { error, data } = await supabase
      .from(t)
      .upsert(rows as Record<string, unknown>[], { onConflict: "id" })
      .select();
    if (error) {
      errors.push(`${t}: ${error.message}`);
      inserted[t] = 0;
    } else {
      inserted[t] = data?.length ?? rows.length;
    }
  }
  return { ok: errors.length === 0, inserted, errors };
}
