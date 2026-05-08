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
  Heart,
  Scale,
  DollarSign,
  Receipt,
  UserCog,
  FolderOpen,
  Mail,
  FileCheck,
  Users2,
  Building2,
  Palette,
  Fingerprint,
  PiggyBank,
  TrendingUp,
  LineChart,
  Wallet,
  HandCoins,
  Tag,
  Percent,
  CalendarPlus,
  CalendarCheck2,
  Timer,
  ClockAlert,
  PenLine,
  Settings,
  UsersRound,
  CalendarDays,
  CalendarClock,
  Coins,
  ListTodo,
  FileBarChart,
  CalendarRange,
  Award,
  Sliders,
  CheckSquare,
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
    title: "خدمات وزارة العدل",
    items: [
      { label: "توثيق عقد النكاح", icon: Heart, to: "/marriage" },
      { label: "كتابة العدل", icon: Scale, to: "/notary" },
    ],
  },
  {
    title: "المالية",
    items: [
      {
        label: "الإدارة المالية",
        icon: DollarSign,
        children: [
          { label: "إدارة الميزانية", icon: PiggyBank, to: "/finance/budget" },
          { label: "المصروفات والإيرادات", icon: TrendingUp, to: "/finance/expenses" },
          { label: "التحليل المالي", icon: LineChart, to: "/finance/analysis" },
          { label: "التقارير المالية", icon: FileBarChart, to: "/finance/reports" },
          { label: "الخزينة", icon: Wallet, to: "/finance/treasury" },
          { label: "اعتماد الرواتب", icon: HandCoins, to: "/finance/salary-approval" },
          { label: "التصنيفات المالية", icon: Tag, to: "/finance/categories" },
          { label: "إعدادات الضريبة", icon: Percent, to: "/finance/tax" },
        ],
      },
      {
        label: "هيئة الزكاة والدخل",
        icon: Receipt,
        children: [
          { label: "إقرارات الزكاة", icon: FileText, to: "/zakat/declarations" },
          { label: "ضريبة القيمة المضافة", icon: Percent, to: "/zakat/vat" },
          { label: "الفواتير الإلكترونية", icon: FileBarChart, to: "/zakat/e-invoicing" },
        ],
      },
    ],
  },
  {
    title: "الموارد البشرية",
    items: [
      {
        label: "الموارد البشرية",
        icon: Users2,
        sections: [
          {
            title: "طلباتي",
            children: [
              { label: "طلب إجازة", icon: CalendarPlus, to: "/hr/my/leave" },
              { label: "تسجيل حضوري", icon: CalendarCheck2, to: "/hr/my/attendance" },
              { label: "طلبات العمل الإضافي", icon: Timer, to: "/hr/my/overtime" },
              { label: "ساعات الاستئذان", icon: ClockAlert, to: "/hr/my/permission" },
              { label: "طلب تبرير التأخير", icon: PenLine, to: "/hr/my/delay" },
            ],
          },
          {
            title: "الإدارة",
            children: [
              { label: "إعدادات الموارد البشرية", icon: Settings, to: "/hr/admin/settings" },
              { label: "إدارة الموظفين", icon: UsersRound, to: "/hr/admin/employees" },
              { label: "الإجازات", icon: CalendarDays, to: "/hr/admin/leaves" },
              { label: "الحضور والانصراف", icon: CalendarClock, to: "/hr/admin/attendance" },
              { label: "إدارة العمل الإضافي", icon: Timer, to: "/hr/admin/overtime" },
              { label: "مسيرات الرواتب", icon: Coins, to: "/hr/admin/payroll" },
              { label: "متابعة الحضور", icon: ListTodo, to: "/hr/admin/attendance-track" },
              { label: "سجل بصمة اليد", icon: Fingerprint, to: "/hr/admin/fingerprint" },
            ],
          },
          {
            title: "التقارير",
            children: [
              { label: "مركز التقارير", icon: FileBarChart, to: "/hr/reports/center" },
              { label: "تقييمات الأداء", icon: Award, to: "/hr/reports/performance" },
              { label: "التقارير الدورية", icon: CalendarRange, to: "/hr/reports/periodic" },
              { label: "إعدادات التقارير", icon: Sliders, to: "/hr/reports/settings" },
            ],
          },
          {
            title: "الاعتمادات",
            children: [
              { label: "اعتماد الإجازات", icon: CheckSquare, to: "/hr/approvals/leaves" },
              { label: "اعتماد العمل الإضافي", icon: CheckSquare, to: "/hr/approvals/overtime" },
              { label: "اعتماد الاستئذان", icon: CheckSquare, to: "/hr/approvals/permission" },
              { label: "اعتماد تبريرات التأخير", icon: CheckSquare, to: "/hr/approvals/delay" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "الأدوات",
    items: [
      { label: "إدارة الملفات", icon: FolderOpen, to: "/files" },
      { label: "البريد الإلكتروني", icon: Mail, to: "/email" },
      { label: "خدمات وثائق", icon: FileCheck, to: "/documents" },
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
      { label: "بصمة الحضور", icon: Fingerprint, to: "/attendance" },
    ],
  },
];
