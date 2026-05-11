import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type AttachmentRecord = {
  name: string;
  size: number;
  type: string;
  // Google Drive metadata (current path)
  driveFileId?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  uploadedAt?: string;
  // Legacy base64 (only on records created before Drive integration)
  dataUrl?: string;
};

export type ClientRecord = {
  id: string;            // UUID (database primary key)
  code: string;          // CLT-XXXXX (display)
  clientType: string;
  contractType: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  fullName: string;
  idNumber: string;
  nationality: string;
  email: string;
  phone: string;
  attachments: AttachmentRecord[];
  notes: string;
  status: "active" | "inactive";
  createdAt: string;
};

// ---------- mappers between DB rows (snake_case) and TS records (camelCase) ----------

type ClientRow = {
  id: string;
  client_code: string;
  client_type: string;
  contract_type: string | null;
  first_name: string | null;
  second_name: string | null;
  third_name: string | null;
  last_name: string | null;
  full_name: string;
  id_number: string | null;
  nationality: string | null;
  email: string | null;
  phone: string | null;
  attachments: AttachmentRecord[] | null;
  notes: string | null;
  status: "active" | "inactive";
  created_at: string;
};

const fromRow = (row: ClientRow): ClientRecord => ({
  id: row.id,
  code: row.client_code,
  clientType: row.client_type,
  contractType: row.contract_type ?? "default",
  firstName: row.first_name ?? "",
  secondName: row.second_name ?? "",
  thirdName: row.third_name ?? "",
  lastName: row.last_name ?? "",
  fullName: row.full_name,
  idNumber: row.id_number ?? "",
  nationality: row.nationality ?? "",
  email: row.email ?? "",
  phone: row.phone ?? "",
  attachments: row.attachments ?? [],
  notes: row.notes ?? "",
  status: row.status,
  createdAt: row.created_at,
});

const toInsert = (
  c: Omit<ClientRecord, "id" | "code" | "createdAt" | "fullName" | "status"> & {
    fullName?: string;
    status?: ClientRecord["status"];
  }
): Record<string, unknown> => ({
  client_code: generateClientCode(),
  client_type: c.clientType,
  contract_type: c.contractType,
  first_name: c.firstName,
  second_name: c.secondName,
  third_name: c.thirdName,
  last_name: c.lastName,
  full_name:
    (c.fullName ??
      [c.firstName, c.secondName, c.thirdName, c.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()) ||
    "—",
  id_number: c.idNumber,
  nationality: c.nationality,
  email: c.email,
  phone: c.phone,
  attachments: c.attachments,
  notes: c.notes,
  status: c.status ?? "active",
});

const toUpdate = (
  c: Partial<Omit<ClientRecord, "id" | "code" | "createdAt">>
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (c.clientType !== undefined) out.client_type = c.clientType;
  if (c.contractType !== undefined) out.contract_type = c.contractType;
  if (c.firstName !== undefined) out.first_name = c.firstName;
  if (c.secondName !== undefined) out.second_name = c.secondName;
  if (c.thirdName !== undefined) out.third_name = c.thirdName;
  if (c.lastName !== undefined) out.last_name = c.lastName;
  if (c.fullName !== undefined) out.full_name = c.fullName;
  if (c.idNumber !== undefined) out.id_number = c.idNumber;
  if (c.nationality !== undefined) out.nationality = c.nationality;
  if (c.email !== undefined) out.email = c.email;
  if (c.phone !== undefined) out.phone = c.phone;
  if (c.attachments !== undefined) out.attachments = c.attachments;
  if (c.notes !== undefined) out.notes = c.notes;
  if (c.status !== undefined) out.status = c.status;
  return out;
};

export function generateClientCode(): string {
  return "CLT-" + Math.floor(10000 + Math.random() * 90000);
}

// ---------- public API ----------

// All ClientRow columns EXCEPT `attachments`. Excluded so legacy base64
// rows don't blow up the list response past the JSON limit. Attachments are
// fetched from Drive on the client detail page.
const LIST_CLIENT_COLUMNS =
  "id,client_code,client_type,contract_type," +
  "first_name,second_name,third_name,last_name,full_name," +
  "id_number,nationality,email,phone,notes,status,created_at";

export async function listClients(): Promise<ClientRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("clients")
    .select(LIST_CLIENT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listClients", error);
    return [];
  }
  const rows = data as unknown as Omit<ClientRow, "attachments">[];
  return rows.map((r) => fromRow({ ...r, attachments: [] } as ClientRow));
}

export async function getClient(id: string): Promise<ClientRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data as ClientRow);
}

export async function addClient(
  input: Omit<ClientRecord, "id" | "code" | "createdAt" | "fullName" | "status"> & {
    fullName?: string;
    status?: ClientRecord["status"];
  }
): Promise<ClientRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("clients")
    .insert(toInsert(input))
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    console.error("addClient", error);
    return null;
  }
  return fromRow(data as ClientRow);
}

export async function updateClient(
  id: string,
  patch: Partial<Omit<ClientRecord, "id" | "code" | "createdAt">>
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("clients").update(toUpdate(patch)).eq("id", id);
  if (error) {
    alert(`فشل التحديث: ${error.message}`);
    console.error("updateClient", error);
    return false;
  }
  return true;
}

// ============================================================
// Attachment helpers — bulk append + remove by index
// ============================================================

export async function addAttachmentsToClient(
  clientId: string,
  files: AttachmentRecord[]
): Promise<boolean> {
  if (!supabase || files.length === 0) return false;
  const { data, error } = await supabase
    .from("clients")
    .select("attachments")
    .eq("id", clientId)
    .maybeSingle();
  if (error || !data) {
    alert(`فشل الحفظ: ${error?.message ?? "العميل غير موجود"}`);
    return false;
  }
  const current = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = [...current, ...files];
  const { error: uerr } = await supabase
    .from("clients")
    .update({ attachments: next })
    .eq("id", clientId);
  if (uerr) {
    alert(`فشل الحفظ: ${uerr.message}`);
    return false;
  }
  return true;
}

export async function removeAttachmentFromClient(
  clientId: string,
  index: number
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("clients")
    .select("attachments")
    .eq("id", clientId)
    .maybeSingle();
  if (error || !data) return false;
  const list = Array.isArray(
    (data as { attachments: AttachmentRecord[] }).attachments
  )
    ? (data as { attachments: AttachmentRecord[] }).attachments
    : [];
  const next = list.filter((_, i) => i !== index);
  const { error: uerr } = await supabase
    .from("clients")
    .update({ attachments: next })
    .eq("id", clientId);
  return !uerr;
}

export async function deleteClient(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    alert(`فشل الحذف: ${error.message}`);
    return false;
  }
  return true;
}

// ---------- React hook with realtime sync ----------

export function useClients() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      const list = await listClients();
      setClients(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`clients-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => refresh()
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { clients, loading, error, refresh };
}
