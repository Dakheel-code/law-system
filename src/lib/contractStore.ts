import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Service = { id: string; name: string; qty: number; price: number };
export type Installment = { id: string; date: string; amount: number; note: string };

export type ContractRecord = {
  id: string;
  code: string;
  clientId: string | null;
  clientSource: "manual" | "user" | "client";
  clientFullName: string;
  clientIdNumber: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientType: string;
  title: string;
  contractType: string;
  startDate: string | null;
  endDate: string | null;
  priority: string;
  description: string;
  services: Service[];
  discountAmount: number;
  discountPercent: number;
  taxRate: number;
  installments: Installment[];
  status: string;
  createdAt: string;
};

type ContractRow = {
  id: string;
  contract_code: string;
  client_id: string | null;
  client_source: string | null;
  client_full_name: string | null;
  client_id_number: string | null;
  client_phone: string | null;
  client_email: string | null;
  client_address: string | null;
  client_type: string | null;
  title: string;
  contract_type: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  description: string | null;
  services: Service[] | null;
  discount_amount: number | null;
  discount_percent: number | null;
  tax_rate: number | null;
  installments: Installment[] | null;
  status: string;
  created_at: string;
};

const fromRow = (r: ContractRow): ContractRecord => ({
  id: r.id,
  code: r.contract_code,
  clientId: r.client_id,
  clientSource: (r.client_source as ContractRecord["clientSource"]) ?? "manual",
  clientFullName: r.client_full_name ?? "",
  clientIdNumber: r.client_id_number ?? "",
  clientPhone: r.client_phone ?? "",
  clientEmail: r.client_email ?? "",
  clientAddress: r.client_address ?? "",
  clientType: r.client_type ?? "individual",
  title: r.title,
  contractType: r.contract_type ?? "",
  startDate: r.start_date,
  endDate: r.end_date,
  priority: r.priority ?? "medium",
  description: r.description ?? "",
  services: r.services ?? [],
  discountAmount: r.discount_amount ?? 0,
  discountPercent: r.discount_percent ?? 0,
  taxRate: r.tax_rate ?? 15,
  installments: r.installments ?? [],
  status: r.status,
  createdAt: r.created_at,
});

export function generateContractCode(): string {
  return "CNT-" + Math.floor(10000 + Math.random() * 90000);
}

export type ContractInput = {
  source?: string;
  clientType?: string;
  fullName?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  contractTitle?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
  description?: string;
  services?: Service[];
  discount?: number;
  discountPercent?: number;
  taxRate?: string;
  installments?: Installment[];
};

const buildInsert = (form: ContractInput): Record<string, unknown> => ({
  contract_code: generateContractCode(),
  client_id: null,
  client_source: form.source ?? "manual",
  client_full_name: form.fullName,
  client_id_number: form.idNumber,
  client_phone: form.phone,
  client_email: form.email,
  client_address: form.address,
  client_type: form.clientType ?? "individual",
  title: form.contractTitle || "—",
  contract_type: form.contractType,
  start_date: form.startDate || null,
  end_date: form.endDate || null,
  priority: form.priority ?? "medium",
  description: form.description,
  services: form.services ?? [],
  discount_amount: form.discount ?? 0,
  discount_percent: form.discountPercent ?? 0,
  tax_rate: parseFloat(form.taxRate ?? "15") || 15,
  installments: form.installments ?? [],
  status: "draft",
});

export async function listContracts(): Promise<ContractRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listContracts", error);
    return [];
  }
  return (data as ContractRow[]).map(fromRow);
}

export async function addContract(form: ContractInput): Promise<ContractRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("contracts")
    .insert(buildInsert(form))
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as ContractRow);
}

export async function deleteContract(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  if (error) {
    alert(`فشل الحذف: ${error.message}`);
    return false;
  }
  return true;
}

export function useContracts() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listContracts();
    setContracts(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`contracts-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contracts" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { contracts, loading, refresh };
}
