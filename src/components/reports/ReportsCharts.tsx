import { BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";

export default function ReportsCharts() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="الطلبات حسب الحالة" subtitle="توزيع الحالات">
          <EmptyState icon={PieChart} text="لا توجد بيانات" />
        </SectionCard>
        <SectionCard
          title="اتجاه الطلبات"
          subtitle="الطلبات الجديدة والمكتملة"
          className="lg:col-span-2"
        >
          <EmptyState icon={LineChart} text="لا توجد بيانات" />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard
          title="تفصيل الطلبات حسب الحالة"
          subtitle="عدد كل حالة"
          className="lg:col-span-2"
        >
          <EmptyState icon={BarChart3} text="لا توجد بيانات" />
        </SectionCard>
        <SectionCard
          title="المحامون الأكثر استلاماً للطلبات"
          subtitle="ترتيب المحامين"
        >
          <EmptyState icon={TrendingUp} text="لا توجد بيانات" />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="الطلبات حسب المصدر" subtitle="مصادر الطلبات">
          <EmptyState icon={BarChart3} text="لا توجد بيانات" />
        </SectionCard>
        <SectionCard title="الطلبات حسب نوع العميل" subtitle="توزيع حسب العميل">
          <EmptyState icon={BarChart3} text="لا توجد بيانات" />
        </SectionCard>
        <SectionCard title="الطلبات حسب الأولوية" subtitle="مستوى الأولوية">
          <EmptyState icon={PieChart} text="لا توجد بيانات" />
        </SectionCard>
      </div>
    </div>
  );
}
