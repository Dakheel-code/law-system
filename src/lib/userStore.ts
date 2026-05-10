import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type UserRecord = {
  id: string;             // UUID (database primary key)
  code: string;           // USR-XXXXX (display)
  type: string;
  fullName: string;
  firstName: string;
  middleName: string;
  thirdName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  avatarDataUrl: string | null;
  status: "active" | "inactive";
  createdAt: string;
};

type StaffRow = {
  id: string;
  user_code: string;
  type: string | null;
  full_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  third_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  nationality: string | null;
  avatar_data_url: string | null;
  status: "active" | "inactive";
  created_at: string;
};

const fromRow = (row: StaffRow): UserRecord => ({
  id: row.id,
  code: row.user_code,
  type: row.type ?? "",
  fullName: row.full_name ?? "",
  firstName: row.first_name ?? "",
  middleName: row.middle_name ?? "",
  thirdName: row.third_name ?? "",
  lastName: row.last_name ?? "",
  email: row.email ?? "",
  phone: row.phone ?? "",
  idNumber: row.id_number ?? "",
  nationality: row.nationality ?? "",
  avatarDataUrl: row.avatar_data_url,
  status: row.status,
  createdAt: row.created_at,
});

const toInsert = (
  u: Omit<UserRecord, "id" | "code" | "createdAt" | "status"> & {
    code?: string;
    status?: UserRecord["status"];
  }
): Record<string, unknown> => ({
  user_code: u.code ?? generateUserCode(),
  type: u.type,
  full_name: u.fullName,
  first_name: u.firstName,
  middle_name: u.middleName,
  third_name: u.thirdName,
  last_name: u.lastName,
  email: u.email,
  phone: u.phone,
  id_number: u.idNumber,
  nationality: u.nationality,
  avatar_data_url: u.avatarDataUrl,
  status: u.status ?? "active",
});

const toUpdate = (
  u: Partial<Omit<UserRecord, "id" | "code" | "createdAt">>
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (u.type !== undefined) out.type = u.type;
  if (u.fullName !== undefined) out.full_name = u.fullName;
  if (u.firstName !== undefined) out.first_name = u.firstName;
  if (u.middleName !== undefined) out.middle_name = u.middleName;
  if (u.thirdName !== undefined) out.third_name = u.thirdName;
  if (u.lastName !== undefined) out.last_name = u.lastName;
  if (u.email !== undefined) out.email = u.email;
  if (u.phone !== undefined) out.phone = u.phone;
  if (u.idNumber !== undefined) out.id_number = u.idNumber;
  if (u.nationality !== undefined) out.nationality = u.nationality;
  if (u.avatarDataUrl !== undefined) out.avatar_data_url = u.avatarDataUrl;
  if (u.status !== undefined) out.status = u.status;
  return out;
};

export function generateUserCode(): string {
  return "USR-" + Math.floor(10000 + Math.random() * 90000);
}

// ---------- public API ----------

export async function listUsers(): Promise<UserRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listUsers", error);
    return [];
  }
  return (data as StaffRow[]).map(fromRow);
}

export async function getUser(id: string): Promise<UserRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data as StaffRow);
}

export async function addUser(
  input: Omit<UserRecord, "id" | "code" | "createdAt" | "status"> & {
    code?: string;
    status?: UserRecord["status"];
  }
): Promise<UserRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("staff")
    .insert(toInsert(input))
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    console.error("addUser", error);
    return null;
  }
  return fromRow(data as StaffRow);
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<UserRecord, "id" | "code" | "createdAt">>
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("staff").update(toUpdate(patch)).eq("id", id);
  if (error) {
    alert(`فشل التحديث: ${error.message}`);
    return false;
  }
  return true;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) {
    alert(`فشل الحذف: ${error.message}`);
    return false;
  }
  return true;
}

// ---------- React hook with realtime sync ----------

export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel("staff-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff" },
        () => refresh()
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { users, loading, refresh };
}
