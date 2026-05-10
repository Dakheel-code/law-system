import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import { useCases } from "../../lib/caseStore";
import { courtTypes } from "../../config/caseConfig";

const COLORS = ["#1E9A8A", "#3FA9F5", "#F59E0B", "#E84A6B", "#8B5CF6", "#10B981", "#F97316", "#6366F1", "#EC4899"];

const courtLabel = (key: string) =>
  courtTypes.find((c) => c.value === key)?.label ?? key ?? "غير محدد";

export default function CasesByCourt() {
  const { cases } = useCases();

  if (cases.length === 0) {
    return (
      <SectionCard
        title="القضايا حسب نوع المحكمة"
        subtitle="توزيع القضايا على المحاكم"
      >
        <EmptyState icon={BarChart3} text="لا توجد بيانات" />
      </SectionCard>
    );
  }

  const counts = cases.reduce<Record<string, number>>((acc, c) => {
    const key = c.courtType || "—";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([key, value]) => ({ name: courtLabel(key), value }))
    .sort((a, b) => b.value - a.value);

  return (
    <SectionCard
      title="القضايا حسب نوع المحكمة"
      subtitle={`عدد المحاكم: ${data.length}`}
    >
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontFamily: "Tajawal",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
