import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { CaseFormState } from "../components/cases/caseFormTypes";

export type CaseRecord = {
  id: string;            // UUID
  code: string;          // CSE-XXXXX
  clientId: string | null;
  clientRole: string;
  opponentRole: string;
  caseType: string;
  courtType: string;
  requestTitle: string;
  description: string;
  urgency: string;
  priority: string;
  otherPartyName: string;
  otherPartyId: string;
  otherPartyPhone: string;
  otherPartyAddress: string;
  caseNumber: string;
  claimSubject: string;
  circuitName: string;
  assignmentDate: string | null;
  caseDate: string | null;
  claimType: string;
  estimatedFees: number;
  consultationFees: number;
  expectedCourtFees: number;
  paymentStatus: string;
  paymentMethod: string;
  fees: unknown[];
  feesNotes: string;
  startDate: string | null;
  expectedEndDate: string | null;
  assignedLawyer: string | null;
  linkedContract: string;
  finalNotes: string;
  status: string;
  createdAt: string;
};

type CaseRow = {
  id: string;
  case_code: string;
  client_id: string | null;
  client_role: string | null;
  opponent_role: string | null;
  case_type: string | null;
  court_type: string | null;
  request_title: string | null;
  description: string | null;
  urgency: string | null;
  priority: string | null;
  other_party_name: string | null;
  other_party_id: string | null;
  other_party_phone: string | null;
  other_party_address: string | null;
  case_number: string | null;
  claim_subject: string | null;
  circuit_name: string | null;
  assignment_date: string | null;
  case_date: string | null;
  claim_type: string | null;
  estimated_fees: number | null;
  consultation_fees: number | null;
  expected_court_fees: number | null;
  payment_status: string | null;
  payment_method: string | null;
  fees: unknown[] | null;
  fees_notes: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  assigned_lawyer: string | null;
  linked_contract: string | null;
  final_notes: string | null;
  status: string;
  created_at: string;
};

const fromRow = (r: CaseRow): CaseRecord => ({
  id: r.id,
  code: r.case_code,
  clientId: r.client_id,
  clientRole: r.client_role ?? "plaintiff",
  opponentRole: r.opponent_role ?? "defendant",
  caseType: r.case_type ?? "",
  courtType: r.court_type ?? "",
  requestTitle: r.request_title ?? "",
  description: r.description ?? "",
  urgency: r.urgency ?? "normal",
  priority: r.priority ?? "medium",
  otherPartyName: r.other_party_name ?? "",
  otherPartyId: r.other_party_id ?? "",
  otherPartyPhone: r.other_party_phone ?? "",
  otherPartyAddress: r.other_party_address ?? "",
  caseNumber: r.case_number ?? "",
  claimSubject: r.claim_subject ?? "",
  circuitName: r.circuit_name ?? "",
  assignmentDate: r.assignment_date,
  caseDate: r.case_date,
  claimType: r.claim_type ?? "financial",
  estimatedFees: r.estimated_fees ?? 0,
  consultationFees: r.consultation_fees ?? 0,
  expectedCourtFees: r.expected_court_fees ?? 0,
  paymentStatus: r.payment_status ?? "unpaid",
  paymentMethod: r.payment_method ?? "",
  fees: r.fees ?? [],
  feesNotes: r.fees_notes ?? "",
  startDate: r.start_date,
  expectedEndDate: r.expected_end_date,
  assignedLawyer: r.assigned_lawyer,
  linkedContract: r.linked_contract ?? "",
  finalNotes: r.final_notes ?? "",
  status: r.status,
  createdAt: r.created_at,
});

export function generateCaseCode(): string {
  return "CSE-" + Math.floor(10000 + Math.random() * 90000);
}

const buildInsert = (form: CaseFormState): Record<string, unknown> => ({
  case_code: generateCaseCode(),
  client_id: form.clientId || null,
  client_role: form.clientRole,
  opponent_role: form.opponentRole,
  case_type: form.caseType,
  court_type: form.courtType,
  request_title: form.requestTitle,
  description: form.description,
  urgency: form.urgency,
  priority: form.priority,
  other_party_name: form.otherPartyName,
  other_party_id: form.otherPartyId,
  other_party_phone: form.otherPartyPhone,
  other_party_address: form.otherPartyAddress,
  case_number: form.caseNumber || null,
  claim_subject: form.claimSubject || null,
  circuit_name: form.circuitName || null,
  assignment_date: form.assignmentDate || null,
  case_date: form.caseDate || null,
  claim_type: form.claimType,
  estimated_fees: form.estimatedFees,
  consultation_fees: form.consultationFees,
  expected_court_fees: form.expectedCourtFees,
  payment_status: form.paymentStatus,
  payment_method: form.paymentMethod,
  fees: form.fees,
  fees_notes: form.feesNotes,
  start_date: form.startDate || null,
  expected_end_date: form.expectedEndDate || null,
  assigned_lawyer: form.assignedLawyer || null,
  linked_contract: form.linkedContract,
  final_notes: form.finalNotes,
  status: "active",
});

export async function listCases(): Promise<CaseRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listCases", error);
    return [];
  }
  return (data as CaseRow[]).map(fromRow);
}

export async function getCase(id: string): Promise<CaseRecord | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  return data ? fromRow(data as CaseRow) : null;
}

export async function addCase(form: CaseFormState): Promise<CaseRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cases")
    .insert(buildInsert(form))
    .select()
    .single();
  if (error) {
    alert(`فشل الحفظ: ${error.message}`);
    return null;
  }
  return fromRow(data as CaseRow);
}

export async function deleteCase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) {
    alert(`فشل الحذف: ${error.message}`);
    return false;
  }
  return true;
}

export function useCases() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const list = await listCases();
    setCases(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`cases-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cases" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return { cases, loading, refresh };
}
