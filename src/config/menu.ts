import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  LayoutGrid,
  BarChart3,
  Briefcase,
  FilePlus,
  Inbox,
  ListChecks,
  ClipboardList as ClipList,
  Folder,
  FolderCog,
  MessageSquare,
  MessageCirclePlus,
  Headphones,
  Globe,
  ScrollText,
  FileSignature,
  FileText,
  UserCog,
  Building2,
  Palette,
  UserPlus,
  ShieldCheck,
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
      {
        label: "القضايا",
        icon: Briefcase,
        children: [
          { label: "فتح طلب", icon: FilePlus, to: "/cases/new" },
          { label: "إدارة الطلبات", icon: ListChecks, to: "/cases/requests" },
          { label: "الطلبات المتاحة", icon: Inbox, to: "/cases/available" },
          { label: "طلباتي", icon: ClipList, to: "/cases/my-requests" },
          { label: "قضاياي", icon: Folder, to: "/cases/mine" },
          { label: "إدارة القضايا", icon: FolderCog, to: "/cases" },
        ],
      },
      {
        label: "الاستشارات",
        icon: MessageSquare,
        children: [
          { label: "استشارة جديدة", icon: MessageCirclePlus, to: "/consultations/new" },
          { label: "إدارة الاستشارات", icon: Headphones, to: "/consultations" },
          { label: "استشاراتي", icon: ClipList, to: "/consultations/mine" },
          { label: "الاستشارات المتاحة", icon: Globe, to: "/consultations/available" },
          { label: "سياسة الاستشارات", icon: ScrollText, to: "/consultations/policy" },
        ],
      },
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
