import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import SectionCard from "../ui/SectionCard";

const data = [
  { month: "ديسمبر", cases: 0, revenue: 0 },
  { month: "يناير", cases: 0, revenue: 0 },
  { month: "فبراير", cases: 0, revenue: 0 },
  { month: "مارس", cases: 0, revenue: 0 },
  { month: "أبريل", cases: 0, revenue: 0 },
  { month: "مايو", cases: 0, revenue: 0 },
];

export default function RevenueChart() {
  return (
    <SectionCard
      title="الإيرادات والقضايا الشهرية"
      subtitle="آخر 6 أشهر"
      className="lg:col-span-2"
    >
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="month"
              reversed
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="الإيرادات (ر.س)"
              stroke="#3FA9F5"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cases"
              name="القضايا الجديدة"
              stroke="#1E9A8A"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
