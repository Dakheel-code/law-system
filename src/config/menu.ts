import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  LayoutGrid,
  BarChart3,
  Briefcase,
  FileText,
  UserCog,
  Building2,
  Palette,
  ShieldCheck,
  Gavel,
  Paperclip,
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
      { label: "المهام", icon: LayoutGrid, to: "/tasks" },
      { label: "الإحصائيات والتقارير", icon: BarChart3, to: "/reports" },
    ],
  },
  {
    title: "العمل القانوني",
    items: [
      { label: "القضايا", icon: Briefcase, to: "/cases" },
      { label: "الجلسات", icon: Gavel, to: "/sessions" },
      { label: "المرفقات", icon: Paperclip, to: "/attachments" },
      { label: "التعاقدات", icon: FileText, to: "/contracts" },
    ],
  },
  {
    title: "الإعدادات والإدارة",
    items: [
      {
        label: "المستخدمون",
        icon: UserCog,
        children: [
          { label: "المستخدمين", icon: Users, to: "/users" },
          { label: "إدارة الصلاحيات", icon: ShieldCheck, to: "/users/permissions" },
        ],
      },
      { label: "الإدارة", icon: Building2, to: "/admin" },
      { label: "تخصيص الواجهة", icon: Palette, to: "/theme" },
    ],
  },
];
