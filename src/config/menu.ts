import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  LayoutGrid,
  BarChart3,
  Briefcase,
  FolderCog,
  FileSignature,
  FileText,
  UserCog,
  Building2,
  Palette,
  UserPlus,
  ShieldCheck,
  Gavel,
  type LucideIcon,
} from "lucide-react";

export type MenuChild = { label: string; icon: LucideIcon; to: string };

export type MenuSection = {
  title?: string;
  children: MenuChild[];
};

export type MenuItem = {
  label: string;
  icon: LucideIcon;
  to?: string;
  children?: MenuChild[];
  sections?: MenuSection[];
};

export type MenuGroup = {
  title?: string;
  items: MenuItem[];
};

export const menu: MenuGroup[] = [
  {
    title: "الرئيسية",
    items: [
      { label: "لوحة التحكم", icon: LayoutDashboard, to: "/" },
      { label: "العملاء", icon: Users, to: "/clients" },
      { label: "المواعيد", icon: Clock, to: "/appointments" },
      { label: "التقويم", icon: Calendar, to: "/calendar" },
      { label: "إدارة المهام", icon: LayoutGrid, to: "/tasks" },
      { label: "الإحصائيات والتقارير", icon: BarChart3, to: "/reports" },
    ],
  },
  {
    title: "العمل القانوني",
    items: [
      { label: "إدارة القضايا", icon: Briefcase, to: "/cases" },
      { label: "الجلسات", icon: Gavel, to: "/sessions" },
      {
        label: "التعاقدات",
        icon: FileText,
        children: [
          { label: "عقد جديد", icon: FileSignature, to: "/contracts/new" },
          { label: "إدارة التعاقدات", icon: FolderCog, to: "/contracts" },
        ],
      },
    ],
  },
  {
    title: "الإعدادات والإدارة",
    items: [
      {
        label: "إدارة المستخدم",
        icon: UserCog,
        children: [
          { label: "إضافة مستخدم", icon: UserPlus, to: "/users/new" },
          { label: "عرض المستخدمين", icon: Users, to: "/users" },
          { label: "إدارة الصلاحيات", icon: ShieldCheck, to: "/users/permissions" },
        ],
      },
      { label: "الإدارة", icon: Building2, to: "/admin" },
      { label: "تخصيص الواجهة", icon: Palette, to: "/theme" },
    ],
  },
];
