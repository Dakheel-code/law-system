// Leave requests store — submit, list, approve/reject, balance calculation.
//
// Backed by:
//   public.leave_requests (user_id, type, start_date, end_date, days/hours, status...)
//   public.hr_settings    (annual_leave_days)

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { AttachmentRecord } from "./clientStore";

export type LeaveType = "leave" | "permission" | "delegation";
export type LeaveStatus = "pending" | "approved" | "rejected";

/**
 * Sub-categorization of a leave (when type='leave').
 * Each category controls whether it deducts from the annual balance.
 */
export type LeaveCategory =
  | "annual"        // اعتيادية — تُخصم من الرصيد
  | "sick"          // مرضية — لا تُخصم
  | "maternity"     // أمومة — لا تُخصم
  | "paternity"     // أبوة — لا تُخصم
  | "emergency"     // اضطرارية — تُخصم
  | "marriage"      // زواج — لا تُخصم
  | "bereavement"   // وفاة — لا تُخصم
  | "unpaid";       // بدون راتب — لا تُخصم

export const leaveCategoryLabels: Record<LeaveCategory, string> = {
  annual: "اعتيادية",
  sick: "مرضية",
  maternity: "أمومة",
  paternity: "أبوة",
  emergency: "اضطرارية",
  marriage: "زواج",
  bereavement: "وفاة",
  unpaid: "بدون راتب",
};

export const leaveCategoryClasses: Record<LeaveCategory, string> = {
  annual: "bg-violet-100 text-violet-700",
  sick: "bg-rose-100 text-rose-700",
  maternity: "bg-pink-100 text-pink-700",
  paternity: "bg-sky-100 text-sky-700",
  emergency: "bg-amber-100 text-amber-700",
  marriage: "bg-emerald-100 text-emerald-700",
  bereavement: "bg-slate-200 text-slate-700",
  unpaid: "bg-slate-100 text-slate-600",
};

/** Whether this category counts against the annual leave balance. */
export const leaveCategoryConsumesBalance: Record<LeaveCategory, boolean> = {
  annual: true,
  sick: false,
  maternity: false,
  paternity: false,
  emergency: true,
  marriage: false,
  bereavement: false,
  unpaid: false,
};

export const leaveTypeLabels: Record<LeaveType, string> = {
  leave: "إجازة",
  permission: "استئذان",
  delegation: "انتداب",
};

export const leaveTypeClasses: Record<LeaveType, string> = {
  leave: "bg-violet-100 text-violet-700",
  permission: "bg-sky-100 text-sky-700",
  delegation: "bg-amber-100 text-amber-700",
};

export const leaveStatusLabels: Record<LeaveStatus, string> = {
  pending: "معلَّقة",
  approved: "مقبولة",
  rejected: "مرفوضة",
};

export const leaveStatusClasses: Record<LeaveStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

export type LeaveRequest = {
  id: string;
  userId: string;
  type: LeaveType;
  /** Sub-category — meaningful only when type='leave'. Defaults to 'annual'. */
  category: LeaveCategory;
  startDate: string;          // YYYY-MM-DD
  endDate: string;
  startTime: string | null;   // HH:MM (only for permission)
  endTime: string | null;
  days: number | null;
  hours: number | null;
  reason: string;
  /** Destination — used only when type='delegation' (e.g. مكتب فرعي، محكمة، عميل) */
  destination: string;
  /** Optional: links the delegation to a specific case (and optionally session). */
  caseId: string | null;
  sessionId: string | null;
  /** Drive-backed attachments (medical reports, tickets, ...) */
  attachments: AttachmentRecord[];
  status: LeaveStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectReason: string;
  createdAt: string;
};

type LeaveRow = {
  id: string;
  user_id: string;
  type: string;
  leave_category: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  days: number | null;
  hours: number | null;
  reason: string | null;
  destination: string | null;
  case_id: string | null;
  session_id: string | null;
  attachments: AttachmentRecord[] | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  reject_reason: string | null;
  created_at: string;
};

const fromRow = (r: LeaveRow): LeaveRequest => ({
  id: r.id,
  userId: r.user_id,
  type: (r.type as LeaveType) ?? "leave",
  category: (r.leave_category as LeaveCategory) ?? "annual",
  startDate: r.start_date,
  endDate: r.end_date,
  startTime: r.start_time,
  endTime: r.end_time,
  days: r.days,
  hours: r.hours,
  reason: r.reason ?? "",
  destination: r.destination ?? "",
  caseId: r.case_id,
  sessionId: r.session_id,
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
  status: (r.status as LeaveStatus) ?? "pending",
  approvedBy: r.approved_by,
  approvedAt: r.approved_at,
  rejectReason: r.reject_reason ?? "",
  createdAt: r.created_at,
});

// ============================================================
// CRUD — Leave requests
// ============================================================

export type LeaveInput = {
  type: LeaveType;
  /** Used when type='leave'; defaults to 'annual'. */
  category?: LeaveCategory;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string;
  /** Used only when type='delegation'. */
  destination?: string;
  /** Optional: link delegation to a case (and optionally a session). */
  caseId?: string | null;
  sessionId?: string | null;
};

/** Calculate inclusive days between two YYYY-MM-DD dates. */
export function calcDays(startDate: string, endDate: string): number {
  const a = new Date(startDate + "T00:00:00");
  const b = new Date(endDate + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Calculate hours between two HH:MM strings on the same day. */
export function calcHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(0, eh + em / 60 - sh - sm / 60);
}

export async function addLeaveRequest(
  userId: string,
  input: LeaveInput
): Promise<LeaveRequest | null> {
  if (!supabase) return null;

  const isPermission = input.type === "permission";
  const isLeave = input.type === "leave";
  const isDelegation = input.type === "delegation";
  // Both leave and delegation use full days; only permission uses hours
  const days =
    isLeave || isDelegation
      ? calcDays(input.startDate, input.endDate)
      : null;
  const hours =
    isPermission && input.startTime && input.endTime
      ? calcHours(input.startTime, input.endTime)
      : null;

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      user_id: userId,
      type: input.type,
      leave_category: isLeave ? input.category ?? "annual" : null,
      start_date: input.startDate,
      end_date: isPermission ? input.startDate : input.endDate,
      start_time: isPermission ? input.startTime ?? null : null,
      end_time: isPermission ? input.endTime ?? null : null,
      days,
      hours,
      reason: input.reason ?? "",
      destination: isDelegation ? input.destination ?? "" : "",
      case_id: isDelegation ? input.caseId ?? null : null,
      session_id: isDelegation ? input.sessionId ?? null : null,
      status: "pending",
    })
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as LeaveRow);
}

export async function approveLeaveRequest(
  id: string,
  approverId: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("leave_requests")
    .update({
      status: "approved",
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      reject_reason: "",
    })
    .eq("id", id);
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return false;
  }
  return true;
}

export async function rejectLeaveRequest(
  id: string,
  approverId: string,
  reason: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("leave_requests")
    .update({
      status: "rejected",
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      reject_reason: reason,
    })
    .eq("id", id);
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return false;
  }
  return true;
}

export async function cancelLeaveRequest(id: string): Promise<boolean> {
  if (!supabase) return false;
  // User cancels their own pending request → delete it
  const { error } = await supabase
    .from("leave_requests")
    .delete()
    .eq("id", id)
    .eq("status", "pending");
  return !error;
}

// ============================================================
// Attachment helpers
// ============================================================

export async function addLeaveAttachments(
  leaveId: string,
  files: AttachmentRecord[]
): Promise<boolean> {
  if (!supabase || files.length === 0) return false;
  const { data } = await supabase
    .from("leave_requests")
    .select("attachments")
    .eq("id", leaveId)
    .maybeSingle();
  if (!data) return false;
  const current = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = [...current, ...files];
  const { error } = await supabase
    .from("leave_requests")
    .update({ attachments: next })
    .eq("id", leaveId);
  return !error;
}

export async function removeLeaveAttachment(
  leaveId: string,
  index: number
): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from("leave_requests")
    .select("attachments")
    .eq("id", leaveId)
    .maybeSingle();
  if (!data) return false;
  const list = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = list.filter((_, i) => i !== index);
  const { error } = await supabase
    .from("leave_requests")
    .update({ attachments: next })
    .eq("id", leaveId);
  return !error;
}

// ============================================================
// HR settings
// ============================================================

export type HrSettings = {
  annualLeaveDays: number;
};

export async function getHrSettings(): Promise<HrSettings> {
  if (!supabase) return { annualLeaveDays: 30 };
  const { data } = await supabase
    .from("hr_settings")
    .select("annual_leave_days")
    .limit(1)
    .maybeSingle();
  return {
    annualLeaveDays:
      (data as { annual_leave_days: number } | null)?.annual_leave_days ?? 30,
  };
}

export async function updateHrSettings(
  patch: Partial<HrSettings>
): Promise<boolean> {
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (patch.annualLeaveDays !== undefined)
    row.annual_leave_days = patch.annualLeaveDays;
  if (Object.keys(row).length === 0) return true;
  row.updated_at = new Date().toISOString();
  const { error } = await supabase
    .from("hr_settings")
    .update(row)
    .not("id", "is", null);
  return !error;
}

// ============================================================
// Hooks
// ============================================================

export function useHrSettings() {
  const [settings, setSettings] = useState<HrSettings>({
    annualLeaveDays: 30,
  });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const s = await getHrSettings();
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`hr-settings-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hr_settings" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { settings, loading, refresh };
}

export function useMyLeaveRequests(userId: string | null | undefined) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!userId || !supabase) {
      setRequests([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) {
      setRequests((data as LeaveRow[]).map(fromRow));
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    const sb = supabase;
    if (!sb || !userId) return;
    const channel = sb
      .channel(`my-leaves-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leave_requests",
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

  return { requests, loading, refresh };
}

export function useAllLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setRequests((data as LeaveRow[]).map(fromRow));
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`all-leaves-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leave_requests" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { requests, loading, refresh };
}

// ============================================================
// Balance calculation
// ============================================================

export type LeaveBalance = {
  total: number;       // الرصيد السنوي (من hr_settings)
  used: number;        // المستخدم في السنة الحالية
  pending: number;     // معلَّق (يخصم احتياطياً)
  remaining: number;   // المتاح
};

/**
 * Calculate the user's leave balance for a given year (default = current).
 * Only counts requests with type="leave" (not permission hours).
 *
 * `used`     = SUM(days) for approved requests in the year
 * `pending`  = SUM(days) for pending requests in the year (reserve)
 * `remaining` = total - used - pending
 */
export function calcLeaveBalance(
  requests: LeaveRequest[],
  total: number,
  year: number = new Date().getFullYear()
): LeaveBalance {
  let used = 0;
  let pending = 0;
  requests.forEach((r) => {
    if (r.type !== "leave") return;
    // Only categories flagged as consuming balance count towards it.
    if (!leaveCategoryConsumesBalance[r.category]) return;
    const requestYear = new Date(r.startDate + "T00:00:00").getFullYear();
    if (requestYear !== year) return;
    const days = r.days ?? 0;
    if (r.status === "approved") used += days;
    else if (r.status === "pending") pending += days;
  });
  return {
    total,
    used,
    pending,
    remaining: Math.max(0, total - used - pending),
  };
}
