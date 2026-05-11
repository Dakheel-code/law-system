import { Sun, Moon, Sunset, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCases } from "../../lib/caseStore";
import { useTasks } from "../../lib/taskStore";
import { useCurrentStaff } from "../../lib/userStore";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WelcomeCard() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);
  const { cases } = useCases();
  const { tasks } = useTasks();

  // Greeting name = first name + last name only (per user request)
  const firstLast = [staff?.firstName, staff?.lastName]
    .filter((s) => s && s.trim())
    .join(" ")
    .trim();
  const displayName =
    firstLast ||
    staff?.fullName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "مرحباً";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";
  const GreetIcon = hour < 12 ? Sun : hour < 18 ? Sunset : Moon;

  const t = todayStr();
  const todaySessions = cases.filter((c) => c.startDate === t).length;
  const pendingRequests = cases.filter(
    (c) => c.status === "active" || c.status === "pending"
  ).length;
  const overdueTasks = tasks.filter(
    (k) =>
      k.dueDate &&
      k.dueDate < t &&
      k.status !== "done" &&
      !k.archived
  ).length;

  const todayLabel = new Date().toLocaleDateString("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayHijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 text-white p-6 sm:p-8 shadow-card">
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-white/10" />
      <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="text-right">
          <div className="flex items-center justify-start gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {greeting}، {displayName}
            </h1>
            <GreetIcon className="w-7 h-7" />
          </div>
          <p className="text-brand-50/90 text-sm">
            <bdi dir="rtl">{todayLabel}</bdi>
            <span className="mx-2 opacity-60">|</span>
            <bdi dir="rtl">{todayHijri}</bdi>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 w-full md:w-auto">
          <Stat value={todaySessions} label="جلسات اليوم" />
          <Stat value={pendingRequests} label="طلبات بانتظار الإجراء" />
          <Stat value={overdueTasks} label="مهام متأخرة" highlight={overdueTasks > 0} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`text-center rounded-xl p-3 backdrop-blur-sm ${
        highlight ? "bg-rose-500/30 ring-1 ring-rose-200/40" : "bg-white/15"
      }`}
    >
      <div className="text-2xl font-extrabold leading-none">
        <bdi dir="ltr">{value}</bdi>
      </div>
      <div className="text-[11px] opacity-90 mt-1 leading-tight">{label}</div>
      {highlight && (
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-rose-100">
          <Sparkles className="w-2.5 h-2.5" />
          انتباه
        </div>
      )}
    </div>
  );
}
