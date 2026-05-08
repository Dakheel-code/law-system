export type FeeItem = {
  id: string;
  description: string;
  type: string;
  amount: number;
};

export type CaseFormState = {
  // Step 1 - Client
  clientType: string;
  clientName: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  city: string;
  address: string;

  // Step 2 - Other party + case
  otherPartyName: string;
  otherPartyId: string;
  otherPartyPhone: string;
  otherPartyAddress: string;
  caseType: string;
  courtType: string;
  requestTitle: string;
  urgency: string;
  description: string;

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
  assignedLawyer: string;
  linkedContract: string;

  // Step 6 - Attachments & notes
  finalNotes: string;
};

export const initialCase: CaseFormState = {
  clientType: "individual",
  clientName: "",
  idType: "national",
  idNumber: "",
  phone: "",
  email: "",
  city: "",
  address: "",

  otherPartyName: "",
  otherPartyId: "",
  otherPartyPhone: "",
  otherPartyAddress: "",
  caseType: "",
  courtType: "",
  requestTitle: "",
  urgency: "normal",
  description: "",

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
  linkedContract: "",

  finalNotes: "",
};
