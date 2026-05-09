import { useState } from "react";
import {
  PiggyBank,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
} from "lucide-react";
import InfoBanner from "../../components/ui/InfoBanner";
import SectionCard from "../../components/ui/SectionCard";
import EmptyState from "../../components/ui/EmptyState";

const periods = ["شهري", "ربعي", "نصف سنوي", "سنوي"];

export default function Budget() {
  const [period, setPeriod] = useState("شهري");

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={PiggyBank}
        title="إدارة الميزانية"
        description="حدد ميزانيات للأقسام والمصروفات المختلفة وتتبع الالتزام بها."
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600">
          <Plus className="w-4 h-4" />
          ميزانية جديدة
        </button>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-card">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                period === p
                  ? "bg-brand-500 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي الميزانية"
          value="0.00"
          unit="ر.س"
          icon={Wallet}
          bg="from-sky-400 to-sky-500"
        />
        <KpiCard
          title="المصروفات"
          value="0.00"
          unit="ر.س"
          icon={TrendingDown}
          bg="from-rose-400 to-rose-500"
        />
        <KpiCard
          title="المتبقي"
          value="0.00"
          unit="ر.س"
          icon={TrendingUp}
          bg="from-emerald-500 to-emerald-600"
        />
        <KpiCard
          title="نسبة الالتزام"
          value="0%"
          icon={Target}
          bg="from-violet-500 to-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="ميزانيات الأقسام" subtitle="توزيع الميزانية" className="lg:col-span-2">
          <EmptyState icon={PiggyBank} text="لا توجد ميزانيات محددة بعد" />
        </SectionCard>
        <SectionCard title="التنبيهات" subtitle="تجاوزات وتحذيرات">
          <EmptyState icon={Target} text="لا توجد تنبيهات" />
        </SectionCard>
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 text-right">سجل الميزانيات</h3>
          <p className="text-xs text-slate-400 mt-0.5 text-right">آخر التحديثات</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">القسم</th>
                <th className="px-4 py-3 text-right">الفترة</th>
                <th className="px-4 py-3 text-right">المخصص</th>
                <th className="px-4 py-3 text-right">المنفق</th>
                <th className="px-4 py-3 text-right">المتبقي</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-16">
                  <EmptyState icon={PiggyBank} text="لا توجد ميزانيات في السجل" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  bg,
}: {
  title: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl text-white p-5 shadow-card bg-gradient-to-l ${bg}`}
    >
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="relative flex items-center justify-between">
        <Icon className="w-6 h-6 opacity-80" />
        <div className="text-right">
          <div className="text-sm opacity-90">{title}</div>
          <div className="text-3xl font-extrabold mt-2 flex items-baseline justify-end gap-1.5">
            <span>{value}</span>
            {unit && <span className="text-xs opacity-80">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
