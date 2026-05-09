import { useEffect, useState } from "react";

export type AttachmentRecord = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export type ClientRecord = {
  id: string;
  clientType: string; // individual, private, institution, government, semi-government
  contractType: string; // default, single, annual
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

const STORAGE_KEY = "law-system-clients";

function readAll(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClientRecord[];
  } catch {
    return [];
  }
}

function writeAll(list: ClientRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    alert(
      "تعذّر الحفظ — قد تكون المرفقات كبيرة جداً. حاول رفع ملفات أصغر."
    );
    throw e;
  }
  window.dispatchEvent(new Event("law-system-clients-updated"));
}

export function listClients(): ClientRecord[] {
  return readAll();
}

export function getClient(id: string): ClientRecord | undefined {
  return readAll().find((c) => c.id === id);
}

export function addClient(
  input: Omit<ClientRecord, "id" | "createdAt" | "status" | "fullName"> & {
    id?: string;
    status?: ClientRecord["status"];
  }
): ClientRecord {
  const fullName = [
    input.firstName,
    input.secondName,
    input.thirdName,
    input.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const record: ClientRecord = {
    ...input,
    id: input.id ?? generateClientId(),
    status: input.status ?? "active",
    fullName: fullName || "—",
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(record);
  writeAll(all);
  return record;
}

export function deleteClient(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function updateClient(id: string, patch: Partial<ClientRecord>) {
  writeAll(readAll().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

export function generateClientId(): string {
  return "CLT-" + Math.floor(10000 + Math.random() * 90000);
}

export function useClients() {
  const [clients, setClients] = useState<ClientRecord[]>(readAll);
  useEffect(() => {
    const refresh = () => setClients(readAll());
    window.addEventListener("storage", refresh);
    window.addEventListener("law-system-clients-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("law-system-clients-updated", refresh);
    };
  }, []);
  return clients;
}
