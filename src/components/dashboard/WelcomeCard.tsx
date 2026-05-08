import { Moon } from "lucide-react";
import { office } from "../../config/office";

export default function WelcomeCard() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 text-white p-8 shadow-card">
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-white/10" />
      <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between">
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 mb-2">
            <h1 className="text-3xl font-extrabold">
              {greeting}، {office.user.name}
            </h1>
            <Moon className="w-7 h-7" />
          </div>
          <p className="text-brand-50/90 text-sm">
            لديك <b>0</b> جلسات اليوم و <b>0</b> طلبات بانتظار الإجراء
          </p>
        </div>
      </div>
    </div>
  );
}
