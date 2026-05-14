import { Sun, Moon, Sunset } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrentStaff } from "../../lib/userStore";

export default function WelcomeCard() {
  const { user } = useAuth();
  const { staff } = useCurrentStaff(user?.id);

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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 text-white px-5 py-3 shadow-card">
      <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between gap-3 flex-wrap">
        {/* Greeting — appears on the RIGHT in RTL (first child) */}
        <div className="flex items-center justify-start gap-2 text-right">
          <GreetIcon className="w-5 h-5" />
          <h1 className="text-lg sm:text-xl font-extrabold">
            {greeting}، {displayName}
          </h1>
        </div>
        {/* Date — appears on the LEFT in RTL (last child) */}
        <p className="text-brand-50/90 text-xs text-left">
          <bdi dir="rtl">{todayLabel}</bdi>
          <span className="mx-2 opacity-60">|</span>
          <bdi dir="rtl">{todayHijri}</bdi>
        </p>
      </div>
    </div>
  );
}
