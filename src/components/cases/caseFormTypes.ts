export type FeeItem = {
  id: string;
  description: string;
  type: string;
  amount: number;
};

export type Attachment = {
  name: string;
  size: number;
  type: string;
  driveFileId?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  uploadedAt?: string;
  dataUrl?: string;
};

export type PartyRole = "plaintiff" | "defendant";

export type CaseParty = {
  id: string;
  name: string;
  role: PartyRole;
  idNumber: string;
  phone: string;
  address: string;
  // Added with the opponent-data form expansion:
  lawyer?: string;             // محامي الخصم
  companyName?: string;        // اسم الشركة
  commercialRegistry?: string; // السجل التجاري
  taxNumber?: string;          // الرقم الضريبي
};

export type SessionMode = "in-person" | "online";
export type SessionStatus =
  | "scheduled"     // مجدّولة
  | "held"          // انعقدت
  | "postponed"     // مؤجلة
  | "cancelled";    // ملغاة

import type { AttachmentRecord } from "../../lib/clientStore";

export type CaseSession = {
  id: string;
  mode: SessionMode;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM (24h)
  court: string;
  location: string;      // for in-person
  link: string;          // for online
  details: string;
  // Added by the session-data form expansion:
  sessionNumber?: string;  // رقم الجلسة
  circuit?: string;        // الدائرة
  status?: SessionStatus;  // حالة الجلسة
  decision?: string;       // القرار الصادر
  minutes?: string;        // محضر الجلسة
  nextDate?: string;       // موعد الجلسة القادمة (YYYY-MM-DD)
  nextAction?: string;     // الإجراء القادم
  // Drive-backed attachments stored under: قضية/<title>/الجلسات/<session>
  attachments?: AttachmentRecord[];
};

export type AssignmentRole = "primary" | "assistant" | "supervisor" | "custom";

export type CaseAssignment = {
  userId: string;
  role: AssignmentRole;
  customTitle?: string;
};

export const assignmentRoleLabels: Record<AssignmentRole, string> = {
  primary: "المحامي الأساسي",
  assistant: "المحامي المساعد",
  supervisor: "المشرف القانوني",
  custom: "مخصص",
};

export type CaseFormState = {
  // Step 1 - Client
  clientId: string | null;       // links to an existing client row (set via search/create)
  clientRole: PartyRole;         // العميل: مدعي / مدعى عليه
  clientType: string;
  clientName: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  city: string;
  address: string;

  // Step 2 - Parties + case
  parties: CaseParty[];          // أطراف القضية (multi)
  opponentRole: PartyRole;       // legacy single opponent (kept for back-compat)
  otherPartyName: string;
  otherPartyId: string;
  otherPartyPhone: string;
  otherPartyAddress: string;
  caseType: string;
  courtType: string;
  requestTitle: string;
  urgency: string;
  description: string;
  // Extended case details
  caseNumber: string;            // رقم القضية
  claimSubject: string;          // نوع المطالبة (نصي)
  circuitName: string;           // اسم الدائرة
  assignmentDate: string;        // تاريخ تكليف القضية
  caseDate: string;              // تاريخ القضية

  // Legal narrative (added by migration 017_case_details_fields)
  lawsuitSubject: string;        // موضوع الدعوى
  facts: string;                 // الوقائع
  claims: string;                // الطلبات
  defenses: string;              // الدفوع
  legalBasis: string;            // السند النظامي
  legalArticles: string;         // المواد القانونية
  claimValue: number;            // قيمة المطالبة
  riskLevel: number;             // نسبة الخطورة (0-100)
  caseSummary: string;           // ملخص القضية
  legalStrategy: string;         // الاستراتيجية القانونية

  // Step 3 - Financial
  claimType: string;
  estimatedFees: number;
  consultationFees: number;
  expectedCourtFees: number;
  paymentStatus: string;
  paymentMethod: string;

  // Step 4 - Fees
  fees: FeeItem[];
  feesNotes: string;

  // Step 5 - Duration & admin
  priority: string;
  startDate: string;
  expectedEndDate: string;
  assignedLawyer: string;            // primary (kept for backward compat)
  assignedLawyers: string[];         // multi-lawyer (kept for backward compat)
  assignments: CaseAssignment[];     // per-lawyer roles
  sessions: CaseSession[];           // hearings/meetings
  linkedContract: string;

  // Step 6 - Attachments & notes
  attachments: Attachment[];
  finalNotes: string;
};

export const initialCase: CaseFormState = {
  clientId: null,
  clientRole: "plaintiff",
  clientType: "individual",
  clientName: "",
  idType: "national",
  idNumber: "",
  phone: "",
  email: "",
  city: "",
  address: "",

  parties: [],
  opponentRole: "defendant",
  otherPartyName: "",
  otherPartyId: "",
  otherPartyPhone: "",
  otherPartyAddress: "",
  caseType: "",
  courtType: "",
  requestTitle: "",
  urgency: "normal",
  description: "",
  caseNumber: "",
  claimSubject: "",
  circuitName: "",
  assignmentDate: "",
  caseDate: "",

  lawsuitSubject: "",
  facts: "",
  claims: "",
  defenses: "",
  legalBasis: "",
  legalArticles: "",
  claimValue: 0,
  riskLevel: 0,
  caseSummary: "",
  legalStrategy: "",

  claimType: "financial",
  estimatedFees: 0,
  consultationFees: 0,
  expectedCourtFees: 0,
  paymentStatus: "unpaid",
  paymentMethod: "",

  fees: [{ id: "1", description: "", type: "fixed", amount: 0 }],
  feesNotes: "",

  priority: "medium",
  startDate: "",
  expectedEndDate: "",
  assignedLawyer: "",
  assignedLawyers: [],
  assignments: [],
  sessions: [],
  linkedContract: "",

  attachments: [],
  finalNotes: "",
};
