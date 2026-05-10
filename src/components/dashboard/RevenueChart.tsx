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
import { useCases } from "../../lib/caseStore";
import { useContracts } from "../../lib/contractStore";

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const sumServices = (services: { qty: number; price: number }[]) =>
  services.reduce((s, x) => s + x.qty * x.price, 0);

export default function RevenueChart() {
  const { cases } = useCases();
  const { contracts } = useContracts();

  // last 6 months keys
  const now = new Date();
  const months: { label: string; year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: arabicMonths[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  const data = months.map((m) => {
    const monthCases = cases.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    const monthContracts = contracts.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    return {
      month: m.label,
      cases: monthCases.length,
      revenue: monthContracts.reduce((s, c) => s + sumServices(c.services), 0),
    };
  });

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
              allowDecimals={false}
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
