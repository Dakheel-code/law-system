// قابل للتخصيص لاحقاً من لوحة الإعدادات (المرحلة 8)

export type Option = { value: string; label: string };

export const clientTypes: Option[] = [
  { value: "individual", label: "فرد" },
  { value: "private", label: "قطاع خاص" },
  { value: "institution", label: "مؤسسة" },
  { value: "government", label: "جهة حكومية" },
  { value: "semi-government", label: "شبه حكومية" },
];

export const idTypes: Option[] = [
  { value: "national", label: "هوية وطنية" },
  { value: "iqama", label: "إقامة" },
  { value: "passport", label: "جواز سفر" },
  { value: "cr", label: "سجل تجاري" },
];

export const caseTypes: Option[] = [
  { value: "commercial", label: "تجارية" },
  { value: "labor", label: "عمالية" },
  { value: "real-estate", label: "عقارية" },
  { value: "personal-status", label: "أحوال شخصية" },
  { value: "criminal", label: "جزائية" },
  { value: "administrative", label: "إدارية" },
  { value: "execution", label: "تنفيذية" },
  { value: "civil", label: "حقوقية" },
];

export const courtTypes: Option[] = [
  { value: "general", label: "المحكمة العامة" },
  { value: "commercial", label: "المحكمة التجارية" },
  { value: "labor", label: "المحكمة العمالية" },
  { value: "personal-status", label: "محكمة الأحوال الشخصية" },
  { value: "criminal", label: "المحكمة الجزائية" },
  { value: "administrative", label: "ديوان المظالم" },
  { value: "execution", label: "محكمة التنفيذ" },
  { value: "appeal", label: "محكمة الاستئناف" },
  { value: "supreme", label: "المحكمة العليا" },
];

export const urgencyLevels: Option[] = [
  { value: "normal", label: "عادي" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "عاجل" },
  { value: "critical", label: "حرج" },
];

export const claimTypes: Option[] = [
  { value: "financial", label: "مالية" },
  { value: "non-financial", label: "غير مالية" },
];

export const paymentStatus: Option[] = [
  { value: "unpaid", label: "غير مدفوع" },
  { value: "partial", label: "مدفوع جزئياً" },
  { value: "paid", label: "مدفوع بالكامل" },
];

export const paymentMethods: Option[] = [
  { value: "cash", label: "نقدي" },
  { value: "bank-transfer", label: "تحويل بنكي" },
  { value: "cheque", label: "شيك" },
  { value: "card", label: "بطاقة" },
];

export const feeTypes: Option[] = [
  { value: "fixed", label: "مبلغ ثابت" },
  { value: "percentage", label: "نسبة مئوية" },
  { value: "hourly", label: "بالساعة" },
  { value: "milestone", label: "حسب المرحلة" },
];

export const priorities: Option[] = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

export const cities: Option[] = [
  { value: "riyadh", label: "الرياض" },
  { value: "jeddah", label: "جدة" },
  { value: "makkah", label: "مكة المكرمة" },
  { value: "madinah", label: "المدينة المنورة" },
  { value: "dammam", label: "الدمام" },
  { value: "khobar", label: "الخبر" },
  { value: "tabuk", label: "تبوك" },
  { value: "abha", label: "أبها" },
  { value: "hail", label: "حائل" },
  { value: "qassim", label: "القصيم" },
];
