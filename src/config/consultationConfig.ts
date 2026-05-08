import type { Option } from "./caseConfig";

export const consultationCategories: Option[] = [
  { value: "commercial", label: "تجارية" },
  { value: "labor", label: "عمالية" },
  { value: "real-estate", label: "عقارية" },
  { value: "personal-status", label: "أحوال شخصية" },
  { value: "criminal", label: "جزائية" },
  { value: "tax", label: "ضريبية" },
  { value: "general", label: "عامة" },
];

export const consultationChannels: Option[] = [
  { value: "in-person", label: "حضوري" },
  { value: "phone", label: "هاتفي" },
  { value: "video", label: "مرئي" },
  { value: "written", label: "كتابي" },
];

export const contractTypes: Option[] = [
  { value: "retainer", label: "أتعاب سنوية (Retainer)" },
  { value: "case-based", label: "مرتبط بقضية" },
  { value: "consulting", label: "استشاري" },
  { value: "drafting", label: "صياغة عقود" },
  { value: "service", label: "تقديم خدمة" },
  { value: "milestone", label: "حسب المرحلة" },
];

export const contractStatuses: Option[] = [
  { value: "draft", label: "مسودة" },
  { value: "active", label: "نشط" },
  { value: "expiring", label: "ينتهي قريباً" },
  { value: "ended", label: "منتهي" },
  { value: "cancelled", label: "ملغي" },
];

export const taxRates: Option[] = [
  { value: "0", label: "0% - معفى" },
  { value: "5", label: "5%" },
  { value: "15", label: "15% - ضريبة القيمة المضافة" },
];
