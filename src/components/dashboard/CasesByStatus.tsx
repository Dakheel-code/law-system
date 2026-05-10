import {
  PieChart as PieIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import { useCases } from "../../lib/caseStore";

const COLORS = ["#1E9A8A", "#3FA9F5", "#F59E0B", "#E84A6B", "#8B5CF6"];

const statusLabels: Record<string, string> = {
  active: "نشطة",
  ended: "منتهية",
  deferred: "مؤجلة",
  draft: "مسودة",
  cancelled: "ملغاة",
};

export default function CasesByStatus() {
  const { cases } = useCases();

  if (cases.length === 0) {
    return (
      <SectionCard title="القضايا حسب الحالة" subtitle="توزيع الحالات">
        <EmptyState icon={PieIcon} text="لا توجد بيانات" />
      </SectionCard>
    );
  }

  const counts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([status, value]) => ({
    name: statusLabels[status] ?? status,
    value,
  }));

  return (
    <SectionCard title="القضايا حسب الحالة" subtitle={`المجموع: ${cases.length}`}>
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) =>
                percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""
              }
              outerRadius={90}
              dataKey="value"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontFamily: "Tajawal",
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "Tajawal", fontSize: 12 }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
