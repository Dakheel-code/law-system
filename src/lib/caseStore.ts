import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { CaseFormState } from "../components/cases/caseFormTypes";

export type CaseAttachment = {
  name: string;
  size: number;
  type: string;
  // Google Drive metadata (current path)
  driveFileId?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  uploadedAt?: string;
  // Legacy base64 (only present on records created before Drive integration)
  dataUrl?: string;
};

export type CaseParty = {
  id: string;
  name: string;
  role: "plaintiff" | "defendant";
  idNumber: string;
  phone: string;
  address: string;
  // Optional opponent-side fields (added with the expanded form):
  lawyer?: string;
  companyName?: string;
  commercialRegistry?: string;
  taxNumber?: string;
};

export type CaseAssignment = {
  userId: string;
  role: "primary" | "assistant" | "supervisor" | "custom";
  customTitle?: string;
};

export type CaseSession = {
  id: string;
  mode: "in-person" | "online";
  date: string;
  time: string;
  court: string;
  location: string;
  link: string;
  details: string;
};

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
  parties: CaseParty[];
  caseNumber: string;
  claimSubject: string;
  circuitName: string;
  assignmentDate: string | null;
  caseDate: string | null;
  // Legal narrative (migration 017)
  lawsuitSubject: string;
  facts: string;
  claims: string;
  defenses: string;
  legalBasis: string;
  legalArticles: string;
  claimValue: number;
  riskLevel: number;
  caseSummary: string;
  legalStrategy: string;
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
  assignedLawyers: string[];
  assignments: CaseAssignment[];
  sessions: CaseSession[];
  linkedContract: string;
  attachments: CaseAttachment[];
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
  parties: CaseParty[] | null;
  case_number: string | null;
  claim_subject: string | null;
  circuit_name: string | null;
  assignment_date: string | null;
  case_date: string | null;
  lawsuit_subject: string | null;
  facts: string | null;
  claims: string | null;
  defenses: string | null;
  legal_basis: string | null;
  legal_articles: string | null;
  claim_value: number | null;
  risk_level: number | null;
  case_summary: string | null;
  legal_strategy: string | null;
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
  assigned_lawyers: string[] | null;
  assignments: CaseAssignment[] | null;
  sessions: CaseSession[] | null;
  linked_contract: string | null;
  attachments: CaseAttachment[] | null;
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
  parties: Array.isArray(r.parties) ? r.parties : [],
  caseNumber: r.case_number ?? "",
  claimSubject: r.claim_subject ?? "",
  circuitName: r.circuit_name ?? "",
  assignmentDate: r.assignment_date,
  caseDate: r.case_date,
  lawsuitSubject: r.lawsuit_subject ?? "",
  facts: r.facts ?? "",
  claims: r.claims ?? "",
  defenses: r.defenses ?? "",
  legalBasis: r.legal_basis ?? "",
  legalArticles: r.legal_articles ?? "",
  claimValue: r.claim_value ?? 0,
  riskLevel: r.risk_level ?? 0,
  caseSummary: r.case_summary ?? "",
  legalStrategy: r.legal_strategy ?? "",
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
  assignedLawyers: Array.isArray(r.assigned_lawyers) ? r.assigned_lawyers : [],
  assignments: Array.isArray(r.assignments) ? r.assignments : [],
  sessions: Array.isArray(r.sessions) ? r.sessions : [],
  linkedContract: r.linked_contract ?? "",
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
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
  parties: form.parties ?? [],
  case_number: form.caseNumber || null,
  claim_subject: form.claimSubject || null,
  circuit_name: form.circuitName || null,
  assignment_date: form.assignmentDate || null,
  case_date: form.caseDate || null,
  lawsuit_subject: form.lawsuitSubject || null,
  facts: form.facts || null,
  claims: form.claims || null,
  defenses: form.defenses || null,
  legal_basis: form.legalBasis || null,
  legal_articles: form.legalArticles || null,
  claim_value: form.claimValue || null,
  risk_level: form.riskLevel || null,
  case_summary: form.caseSummary || null,
  legal_strategy: form.legalStrategy || null,
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
  assigned_lawyer:
    form.assignments.find((a) => a.role === "primary")?.userId ||
    form.assignedLawyer ||
    form.assignedLawyers[0] ||
    null,
  assigned_lawyers:
    form.assignments.length > 0
      ? form.assignments.map((a) => a.userId)
      : form.assignedLawyers ?? [],
  assignments: form.assignments ?? [],
  sessions: form.sessions ?? [],
  linked_contract: form.linkedContract,
  attachments: form.attachments ?? [],
  final_notes: form.finalNotes,
  status: "active",
});

// All CaseRow columns EXCEPT `attachments`. Listing the column explicitly
// guards us against legacy base64 payloads ballooning the response past
// the proxy/JSON limit. Attachments are loaded on demand on the detail page
// via the Drive API.
const LIST_CASE_COLUMNS =
  "id,case_code,client_id,client_role,opponent_role,case_type,court_type," +
  "request_title,description,urgency,priority," +
  "other_party_name,other_party_id,other_party_phone,other_party_address," +
  "parties,case_number,claim_subject,circuit_name," +
  "assignment_date,case_date,claim_type," +
  "lawsuit_subject,facts,claims,defenses,legal_basis,legal_articles," +
  "claim_value,risk_level,case_summary,legal_strategy," +
  "estimated_fees,consultation_fees,expected_court_fees," +
  "payment_status,payment_method,fees,fees_notes," +
  "start_date,expected_end_date," +
  "assigned_lawyer,assigned_lawyers,assignments,sessions," +
  "linked_contract,final_notes,status,created_at";

export async function listCases(): Promise<CaseRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cases")
    .select(LIST_CASE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listCases", error);
    return [];
  }
  // attachments is intentionally omitted from the list query — fill with [].
  const rows = data as unknown as Omit<CaseRow, "attachments">[];
  return rows.map((r) => fromRow({ ...r, attachments: [] } as CaseRow));
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

export async function updateCase(
  id: string,
  form: CaseFormState
): Promise<boolean> {
  if (!supabase) return false;
  const payload = buildInsert(form);
  // Drop fields we don't want to overwrite on update
  delete (payload as Record<string, unknown>).case_code;
  delete (payload as Record<string, unknown>).status;
  const { error } = await supabase
    .from("cases")
    .update(payload)
    .eq("id", id);
  if (error) {
    alert(`فشل التحديث: ${error.message}`);
    return false;
  }
  return true;
}

// ============================================================
// Session helpers — single-session CRUD on a case's sessions array
// ============================================================

export async function addSession(
  caseId: string,
  session: CaseSession
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("cases")
    .select("sessions")
    .eq("id", caseId)
    .maybeSingle();
  if (error || !data) {
    alert(`فشل الحفظ: ${error?.message ?? "القضية غير موجودة"}`);
    return false;
  }
  const current = Array.isArray((data as { sessions: CaseSession[] }).sessions)
    ? (data as { sessions: CaseSession[] }).sessions
    : [];
  const next = [...current, session];
  const { error: uerr } = await supabase
    .from("cases")
    .update({ sessions: next })
    .eq("id", caseId);
  if (uerr) {
    alert(`فشل الحفظ: ${uerr.message}`);
    return false;
  }
  return true;
}

export async function updateSessionOnCase(
  caseId: string,
  sessionId: string,
  patch: Partial<CaseSession>
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("cases")
    .select("sessions")
    .eq("id", caseId)
    .maybeSingle();
  if (error || !data) return false;
  const current = Array.isArray((data as { sessions: CaseSession[] }).sessions)
    ? (data as { sessions: CaseSession[] }).sessions
    : [];
  const next = current.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
  const { error: uerr } = await supabase
    .from("cases")
    .update({ sessions: next })
    .eq("id", caseId);
  if (uerr) return false;
  return true;
}

// ============================================================
// Attachment helpers — bulk append + remove by index
// ============================================================

export async function addAttachmentsToCase(
  caseId: string,
  files: CaseAttachment[]
): Promise<boolean> {
  if (!supabase || files.length === 0) return false;
  const { data, error } = await supabase
    .from("cases")
    .select("attachments")
    .eq("id", caseId)
    .maybeSingle();
  if (error || !data) {
    alert(`فشل الحفظ: ${error?.message ?? "القضية غير موجودة"}`);
    return false;
  }
  const current = Array.isArray(
    (data as { attachments: CaseAttachment[] }).attachments
  )
    ? (data as { attachments: CaseAttachment[] }).attachments
    : [];
  const next = [...current, ...files];
  const { error: uerr } = await supabase
    .from("cases")
    .update({ attachments: next })
    .eq("id", caseId);
  if (uerr) {
    alert(`فشل الحفظ: ${uerr.message}`);
    return false;
  }
  return true;
}

export async function removeAttachmentFromCase(
  caseId: string,
  index: number
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("cases")
    .select("attachments")
    .eq("id", caseId)
    .maybeSingle();
  if (error || !data) return false;
  const current = Array.isArray(
    (data as { attachments: CaseAttachment[] }).attachments
  )
    ? (data as { attachments: CaseAttachment[] }).attachments
    : [];
  const next = current.filter((_, i) => i !== index);
  const { error: uerr } = await supabase
    .from("cases")
    .update({ attachments: next })
    .eq("id", caseId);
  if (uerr) return false;
  return true;
}

export async function removeSession(
  caseId: string,
  sessionId: string
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("cases")
    .select("sessions")
    .eq("id", caseId)
    .maybeSingle();
  if (error || !data) return false;
  const current = Array.isArray((data as { sessions: CaseSession[] }).sessions)
    ? (data as { sessions: CaseSession[] }).sessions
    : [];
  const next = current.filter((s) => s.id !== sessionId);
  const { error: uerr } = await supabase
    .from("cases")
    .update({ sessions: next })
    .eq("id", caseId);
  if (uerr) return false;
  return true;
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
