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
  dataUrl: string;
};

export type PartyRole = "plaintiff" | "defendant";

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

  // Step 2 - Other party + case
  opponentRole: PartyRole;       // الخصم: مدعي / مدعى عليه
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
  assignedLawyers: string[];         // multi-lawyer assignment
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
  linkedContract: "",

  attachments: [],
  finalNotes: "",
};
