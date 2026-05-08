import type { Option } from "./caseConfig";

export const userTypes: Option[] = [
  { value: "manager", label: "مدير" },
  { value: "lawyer", label: "محامي" },
  { value: "supervisor", label: "مشرف" },
  { value: "coordinator", label: "منسق" },
  { value: "support", label: "دعم فني" },
  { value: "customer-service", label: "خدمة عملاء" },
];

export type Role = {
  key: string;
  label: string;
  count: number;
};

export const roles: Role[] = [
  { key: "lawyer", label: "محامي", count: 27 },
  { key: "supervisor", label: "مشرف", count: 0 },
  { key: "coordinator", label: "منسق", count: 0 },
  { key: "support", label: "دعم فني", count: 0 },
  { key: "customer-service", label: "خدمة عملاء", count: 0 },
  { key: "client", label: "عميل", count: 5 },
];

export type Permission = {
  key: string;
  label: string;
  default?: boolean;
};

export type PermissionGroup = {
  key: string;
  title: string;
  iconName: "general" | "cases" | "consultations" | "contracts" | "clients" | "finance" | "hr";
  permissions: Permission[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    key: "general",
    title: "عام",
    iconName: "general",
    permissions: [
      { key: "view-stats", label: "عرض الإحصائيات" },
      { key: "view-all-tasks", label: "عرض جميع المهام" },
      { key: "email", label: "البريد الإلكتروني", default: true },
      { key: "attendance", label: "بصمة الحضور" },
      { key: "view-my-tasks", label: "عرض مهامي", default: true },
      { key: "assign-tasks", label: "إسناد المهام للموظفين" },
      { key: "manage-files", label: "إدارة الملفات (إعادة تسمية وحذف)", default: true },
      { key: "manage-tasks", label: "إدارة المهام", default: true },
    ],
  },
  {
    key: "cases",
    title: "القضايا والطلبات",
    iconName: "cases",
    permissions: [
      { key: "manage-requests", label: "إدارة الطلبات", default: true },
      { key: "manage-cases", label: "إدارة القضايا", default: true },
      { key: "approve-requests", label: "اعتماد الطلبات" },
      { key: "edit-cases", label: "تعديل القضايا", default: true },
      { key: "edit-sessions", label: "تعديل الجلسات", default: true },
      { key: "assign-requests", label: "تعيين الطلبات" },
      { key: "receive-requests", label: "استلام الطلبات", default: true },
      { key: "view-available", label: "عرض جميع الطلبات المتاحة", default: true },
      { key: "open-new-cases", label: "فتح قضايا جديدة", default: true },
      { key: "delete-cases", label: "حذف القضايا" },
      { key: "approve-cases", label: "اعتماد القضايا" },
      { key: "approve-edits", label: "اعتماد طلبات تعديل القضايا" },
      { key: "view-my-cases", label: "عرض قضاياي", default: true },
      { key: "open-new-request", label: "فتح طلب جديد", default: true },
      { key: "view-my-requests", label: "عرض طلباتي", default: true },
    ],
  },
  {
    key: "consultations",
    title: "الاستشارات",
    iconName: "consultations",
    permissions: [
      { key: "manage-consultations", label: "إدارة الاستشارات", default: true },
      { key: "view-my-consultations", label: "عرض استشاراتي", default: true },
      { key: "request-consultation", label: "طلب استشارة جديدة", default: true },
    ],
  },
  {
    key: "contracts",
    title: "التعاقدات",
    iconName: "contracts",
    permissions: [
      { key: "manage-contracts", label: "إدارة التعاقدات", default: true },
      { key: "create-contract", label: "إنشاء عقد جديد", default: true },
      { key: "approve-contracts", label: "اعتماد العقود" },
      { key: "delete-contracts", label: "حذف العقود" },
    ],
  },
  {
    key: "clients",
    title: "العملاء",
    iconName: "clients",
    permissions: [
      { key: "view-clients", label: "عرض العملاء", default: true },
      { key: "manage-clients", label: "إدارة العملاء" },
      { key: "delete-client", label: "حذف عميل" },
    ],
  },
  {
    key: "finance",
    title: "المالية",
    iconName: "finance",
    permissions: [
      { key: "view-finance", label: "عرض البيانات المالية" },
      { key: "manage-budget", label: "إدارة الميزانية" },
      { key: "approve-payments", label: "اعتماد المدفوعات" },
      { key: "view-payroll", label: "عرض الرواتب" },
    ],
  },
  {
    key: "hr",
    title: "الموارد البشرية",
    iconName: "hr",
    permissions: [
      { key: "manage-employees", label: "إدارة الموظفين" },
      { key: "approve-leaves", label: "اعتماد الإجازات" },
      { key: "view-attendance", label: "عرض الحضور" },
      { key: "view-performance", label: "عرض تقييمات الأداء" },
    ],
  },
];

export const defaultPermissionsFor = (role: string): string[] => {
  if (role === "lawyer") {
    return permissionGroups.flatMap((g) =>
      g.permissions.filter((p) => p.default).map((p) => p.key)
    );
  }
  if (role === "client") {
    return [
      "view-my-cases",
      "view-my-requests",
      "view-my-consultations",
      "request-consultation",
      "open-new-request",
    ];
  }
  return [];
};
