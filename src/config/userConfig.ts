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
  { key: "manager", label: "مدير", count: 0 },
  { key: "lawyer", label: "محامي", count: 0 },
  { key: "supervisor", label: "مشرف", count: 0 },
  { key: "coordinator", label: "منسق", count: 0 },
  { key: "support", label: "دعم فني", count: 0 },
  { key: "customer-service", label: "خدمة عملاء", count: 0 },
];

export type Permission = {
  key: string;
  label: string;
  default?: boolean;
};

/**
 * Icon names allowed for permission groups.
 * Maps to lucide icons in src/pages/users/Permissions.tsx → groupIcons.
 */
export type PermissionIconName =
  | "general"
  | "cases"
  | "sessions"
  | "tasks"
  | "clients"
  | "contracts"
  | "attachments"
  | "calendar"
  | "appointments"
  | "reports"
  | "hr"
  | "admin"
  | "theme";

export type PermissionGroup = {
  key: string;
  title: string;
  iconName: PermissionIconName;
  permissions: Permission[];
};

// ============================================================
// Permission groups — mapped 1:1 to actual features in the system.
//
// Naming convention: `<module>.<action>`
//   - .view      → عرض
//   - .view_mine → عرض ما يخص المستخدم فقط
//   - .create    → إضافة
//   - .edit      → تعديل
//   - .delete    → حذف
//   - .approve   → قبول/اعتماد
//   - .reject    → رفض
//   - .manage_*  → التحكم الكامل في عنصر داخلي
// ============================================================

export const permissionGroups: PermissionGroup[] = [
  // ------------------------------------------------------------
  // عام — لوحة التحكم والمواعيد والتقويم والتقارير
  // ------------------------------------------------------------
  {
    key: "general",
    title: "عام",
    iconName: "general",
    permissions: [
      { key: "dashboard.view", label: "عرض لوحة التحكم", default: true },
      { key: "calendar.view", label: "عرض التقويم", default: true },
      { key: "reports.view", label: "عرض الإحصائيات والتقارير" },
    ],
  },

  // ------------------------------------------------------------
  // المواعيد
  // ------------------------------------------------------------
  {
    key: "appointments",
    title: "المواعيد",
    iconName: "appointments",
    permissions: [
      { key: "appointments.view", label: "عرض المواعيد", default: true },
      { key: "appointments.create", label: "إضافة موعد", default: true },
      { key: "appointments.edit", label: "تعديل المواعيد" },
      { key: "appointments.delete", label: "حذف المواعيد" },
    ],
  },

  // ------------------------------------------------------------
  // العملاء
  // ------------------------------------------------------------
  {
    key: "clients",
    title: "العملاء",
    iconName: "clients",
    permissions: [
      { key: "clients.view", label: "عرض العملاء", default: true },
      { key: "clients.create", label: "إضافة عميل" },
      { key: "clients.edit", label: "تعديل بيانات العملاء" },
      { key: "clients.delete", label: "حذف العملاء" },
      { key: "clients.attachments.view", label: "عرض مرفقات العملاء" },
      { key: "clients.attachments.manage", label: "إدارة مرفقات العملاء (رفع/حذف)" },
    ],
  },

  // ------------------------------------------------------------
  // القضايا
  // ------------------------------------------------------------
  {
    key: "cases",
    title: "القضايا",
    iconName: "cases",
    permissions: [
      { key: "cases.view_all", label: "عرض جميع القضايا" },
      { key: "cases.view_mine", label: "عرض القضايا المسندة لي فقط", default: true },
      { key: "cases.create", label: "فتح قضية جديدة" },
      { key: "cases.edit", label: "تعديل القضايا" },
      { key: "cases.delete", label: "حذف القضايا" },
      { key: "cases.assign", label: "إسناد القضايا للمحامين" },
      { key: "cases.parties.manage", label: "إدارة أطراف القضية" },
      { key: "cases.legal.view", label: "عرض التفاصيل القانونية" },
      { key: "cases.legal.edit", label: "تعديل التفاصيل القانونية" },
      { key: "cases.financial.view", label: "عرض الجانب المالي للقضية" },
      { key: "cases.financial.manage", label: "إدارة الأتعاب والدفعات" },
      { key: "cases.attachments.manage", label: "إدارة مرفقات القضية" },
      { key: "cases.notes.edit", label: "إضافة وتعديل الملاحظات النهائية" },
    ],
  },

  // ------------------------------------------------------------
  // الجلسات
  // ------------------------------------------------------------
  {
    key: "sessions",
    title: "الجلسات",
    iconName: "sessions",
    permissions: [
      { key: "sessions.view_all", label: "عرض جميع الجلسات" },
      { key: "sessions.view_mine", label: "عرض جلسات قضاياي فقط", default: true },
      { key: "sessions.create", label: "إضافة جلسة" },
      { key: "sessions.edit", label: "تعديل الجلسات" },
      { key: "sessions.delete", label: "حذف الجلسات" },
      { key: "sessions.attachments.manage", label: "إدارة مرفقات الجلسات" },
    ],
  },

  // ------------------------------------------------------------
  // المهام
  // ------------------------------------------------------------
  {
    key: "tasks",
    title: "المهام",
    iconName: "tasks",
    permissions: [
      { key: "tasks.view_all", label: "عرض جميع المهام" },
      { key: "tasks.view_mine", label: "عرض مهامي فقط", default: true },
      { key: "tasks.create", label: "إنشاء مهمة جديدة", default: true },
      { key: "tasks.assign", label: "إسناد المهام للموظفين" },
      { key: "tasks.edit_all", label: "تعديل أي مهمة" },
      { key: "tasks.edit_mine", label: "تعديل مهامي المُسنَدة", default: true },
      { key: "tasks.delete", label: "حذف المهام" },
      { key: "tasks.comments.add", label: "إضافة تعليقات على المهام", default: true },
      { key: "tasks.attachments.manage", label: "إدارة مرفقات المهام" },
    ],
  },

  // ------------------------------------------------------------
  // التعاقدات
  // ------------------------------------------------------------
  {
    key: "contracts",
    title: "التعاقدات",
    iconName: "contracts",
    permissions: [
      { key: "contracts.view", label: "عرض التعاقدات", default: true },
      { key: "contracts.create", label: "إنشاء عقد جديد" },
      { key: "contracts.edit", label: "تعديل العقود" },
      { key: "contracts.delete", label: "حذف العقود" },
      { key: "contracts.approve", label: "اعتماد العقود" },
      { key: "contracts.reject", label: "رفض العقود" },
    ],
  },

  // ------------------------------------------------------------
  // المرفقات (متصفح Drive العام)
  // ------------------------------------------------------------
  {
    key: "attachments",
    title: "المرفقات (Drive)",
    iconName: "attachments",
    permissions: [
      { key: "attachments.view", label: "تصفح المرفقات", default: true },
      { key: "attachments.upload", label: "رفع ملفات" },
      { key: "attachments.delete", label: "حذف الملفات والمجلدات" },
      { key: "attachments.rename", label: "إعادة تسمية الملفات والمجلدات" },
      { key: "attachments.create_folder", label: "إنشاء مجلدات جديدة" },
    ],
  },

  // ------------------------------------------------------------
  // الموارد البشرية — الحضور والإجازات
  // ------------------------------------------------------------
  {
    key: "hr",
    title: "الموارد البشرية",
    iconName: "hr",
    permissions: [
      // Personal (every employee)
      { key: "hr.attendance.self", label: "تسجيل حضور وانصراف لنفسي", default: true },
      { key: "hr.leaves.request", label: "تقديم طلب إجازة/استئذان/انتداب", default: true },
      // Admin (manager-level)
      { key: "hr.attendance.view_all", label: "عرض حضور جميع الموظفين" },
      { key: "hr.attendance.edit", label: "تعديل سجلات الحضور يدوياً" },
      { key: "hr.attendance.reports", label: "عرض تقارير الحضور (يومي/شهري/سنوي)" },
      { key: "hr.leaves.view_all", label: "عرض طلبات جميع الموظفين" },
      { key: "hr.leaves.approve", label: "قبول طلبات الإجازات والاستئذانات" },
      { key: "hr.leaves.reject", label: "رفض طلبات الإجازات والاستئذانات" },
      { key: "hr.locations.manage", label: "إدارة مواقع المكاتب" },
      { key: "hr.holidays.manage", label: "إدارة الإجازات الرسمية" },
      { key: "hr.settings.manage", label: "تعديل إعدادات الموارد البشرية (الرصيد السنوي)" },
    ],
  },

  // ------------------------------------------------------------
  // المستخدمون والإدارة
  // ------------------------------------------------------------
  {
    key: "admin",
    title: "المستخدمون والإدارة",
    iconName: "admin",
    permissions: [
      { key: "users.view", label: "عرض المستخدمين" },
      { key: "users.create", label: "إضافة مستخدم جديد" },
      { key: "users.edit", label: "تعديل بيانات المستخدمين" },
      { key: "users.delete", label: "حذف المستخدمين" },
      { key: "users.permissions.manage", label: "إدارة الصلاحيات والأدوار" },
      { key: "admin.drive.manage", label: "إدارة ربط Google Drive" },
      { key: "admin.settings", label: "الوصول للإعدادات العامة" },
    ],
  },

  // ------------------------------------------------------------
  // تخصيص الواجهة
  // ------------------------------------------------------------
  {
    key: "theme",
    title: "تخصيص الواجهة",
    iconName: "theme",
    permissions: [
      { key: "theme.view", label: "عرض إعدادات الواجهة" },
      { key: "theme.edit", label: "تعديل ألوان وشكل الواجهة" },
    ],
  },
];

/**
 * Default permission set per role.
 *   - manager  → كل شيء (يُحسب ديناميكياً)
 *   - lawyer   → الافتراضيات + الصلاحيات الأساسية للمحامي
 *   - client   → عرض ما يخصه فقط
 *   - باقي الأدوار → الافتراضيات فقط
 */
export const defaultPermissionsFor = (role: string): string[] => {
  if (role === "manager") {
    // Manager gets everything
    return permissionGroups.flatMap((g) =>
      g.permissions.map((p) => p.key)
    );
  }
  if (role === "lawyer") {
    return [
      // Defaults from all groups
      ...permissionGroups.flatMap((g) =>
        g.permissions.filter((p) => p.default).map((p) => p.key)
      ),
      // Plus lawyer-specific
      "cases.create",
      "cases.edit",
      "cases.legal.view",
      "cases.legal.edit",
      "cases.parties.manage",
      "cases.attachments.manage",
      "sessions.create",
      "sessions.edit",
      "sessions.attachments.manage",
      "tasks.assign",
      "tasks.attachments.manage",
      "clients.create",
      "clients.edit",
      "clients.attachments.manage",
      "contracts.create",
      "attachments.upload",
      "attachments.create_folder",
    ];
  }
  if (role === "supervisor") {
    return [
      ...permissionGroups.flatMap((g) =>
        g.permissions.filter((p) => p.default).map((p) => p.key)
      ),
      "cases.view_all",
      "sessions.view_all",
      "tasks.view_all",
      "tasks.assign",
      "reports.view",
    ];
  }
  if (role === "coordinator") {
    return [
      ...permissionGroups.flatMap((g) =>
        g.permissions.filter((p) => p.default).map((p) => p.key)
      ),
      "appointments.create",
      "appointments.edit",
      "clients.create",
      "clients.edit",
      "tasks.assign",
    ];
  }
  if (role === "customer-service") {
    return [
      "dashboard.view",
      "calendar.view",
      "clients.view",
      "appointments.view",
      "appointments.create",
      "appointments.edit",
      "hr.attendance.self",
      "hr.leaves.request",
    ];
  }
  if (role === "support") {
    return [
      "dashboard.view",
      "calendar.view",
      "hr.attendance.self",
      "hr.leaves.request",
    ];
  }
  // Fallback: only defaults
  return permissionGroups.flatMap((g) =>
    g.permissions.filter((p) => p.default).map((p) => p.key)
  );
};
