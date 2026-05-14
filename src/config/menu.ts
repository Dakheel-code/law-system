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
  Gavel,
  Paperclip,
  MapPin,
  CalendarOff,
  Fingerprint,
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
    title: "الموارد البشرية",
    items: [
      { label: "حضوري", icon: Fingerprint, to: "/hr/attendance" },
      { label: "مواقع المكاتب", icon: MapPin, to: "/hr/locations" },
      { label: "الإجازات الرسمية", icon: CalendarOff, to: "/hr/holidays" },
    ],
  },
  {
    title: "الإعدادات والإدارة",
    items: [
      { label: "المستخدمين", icon: UserCog, to: "/users" },
      { label: "الإدارة", icon: Building2, to: "/admin" },
      { label: "تخصيص الواجهة", icon: Palette, to: "/theme" },
    ],
  },
];
