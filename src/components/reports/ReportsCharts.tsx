import {
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import { useCases } from "../../lib/caseStore";
import { useClients } from "../../lib/clientStore";
import { useContracts } from "../../lib/contractStore";
import { caseTypes, courtTypes } from "../../config/caseConfig";

const COLORS = [
  "#1E9A8A",
  "#3FA9F5",
  "#F59E0B",
  "#E84A6B",
  "#8B5CF6",
  "#10B981",
  "#F97316",
  "#6366F1",
  "#EC4899",
];

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

const last6Months = () => {
  const out: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: arabicMonths[d.getMonth()],
    });
  }
  return out;
};

const statusLabels: Record<string, string> = {
  active: "نشطة",
  ended: "منتهية",
  deferred: "مؤجلة",
  draft: "مسودة",
  cancelled: "ملغاة",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
  critical: "حرجة",
};

const clientTypeLabels: Record<string, string> = {
  individual: "أفراد",
  private: "قطاع خاص",
  institution: "مؤسسات",
  government: "جهة حكومية",
  "semi-government": "شبه حكومية",
};

export default function ReportsCharts({ tab }: { tab: string }) {
  if (tab === "clients") return <ClientsCharts />;
  if (tab === "payments") return <PaymentsCharts />;
  return <CasesCharts />;
}

function CasesCharts() {
  const { cases } = useCases();

  // by status
  const statusCounts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([k, v]) => ({
    name: statusLabels[k] ?? k,
    value: v,
  }));

  // by month (last 6 months)
  const monthBuckets = last6Months();
  const monthlyData = monthBuckets.map((m) => {
    const monthCases = cases.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    return {
      month: m.label,
      جديدة: monthCases.length,
      مكتملة: monthCases.filter((c) => c.status === "ended").length,
    };
  });

  // by court
  const courtCounts = cases.reduce<Record<string, number>>((acc, c) => {
    const k = c.courtType || "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const courtData = Object.entries(courtCounts).map(([k, v]) => ({
    name: courtTypes.find((t) => t.value === k)?.label ?? k,
    value: v,
  }));

  // by type
  const typeCounts = cases.reduce<Record<string, number>>((acc, c) => {
    const k = c.caseType || "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeCounts).map(([k, v]) => ({
    name: caseTypes.find((t) => t.value === k)?.label ?? k,
    value: v,
  }));

  // by priority
  const priorityCounts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.priority] = (acc[c.priority] ?? 0) + 1;
    return acc;
  }, {});
  const priorityData = Object.entries(priorityCounts).map(([k, v]) => ({
    name: priorityLabels[k] ?? k,
    value: v,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="القضايا حسب الحالة" subtitle={`المجموع: ${cases.length}`}>
          {statusData.length === 0 ? (
            <EmptyState icon={PieIcon} text="لا توجد بيانات" />
          ) : (
            <PieBlock data={statusData} />
          )}
        </SectionCard>
        <SectionCard
          title="اتجاه القضايا"
          subtitle="آخر 6 أشهر"
          className="lg:col-span-2"
        >
          {cases.length === 0 ? (
            <EmptyState icon={LineIcon} text="لا توجد بيانات" />
          ) : (
            <LineBlock data={monthlyData} keys={["جديدة", "مكتملة"]} />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard
          title="القضايا حسب المحكمة"
          subtitle={`عدد المحاكم: ${courtData.length}`}
          className="lg:col-span-2"
        >
          {courtData.length === 0 ? (
            <EmptyState icon={BarChart3} text="لا توجد بيانات" />
          ) : (
            <BarBlock data={courtData} />
          )}
        </SectionCard>
        <SectionCard title="القضايا حسب الأولوية" subtitle="مستوى الأولوية">
          {priorityData.length === 0 ? (
            <EmptyState icon={PieIcon} text="لا توجد بيانات" />
          ) : (
            <PieBlock data={priorityData} />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
        <SectionCard title="القضايا حسب النوع" subtitle="تصنيف القضايا">
          {typeData.length === 0 ? (
            <EmptyState icon={BarChart3} text="لا توجد بيانات" />
          ) : (
            <BarBlock data={typeData} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function ClientsCharts() {
  const { clients } = useClients();

  const typeCounts = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.clientType] = (acc[c.clientType] ?? 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeCounts).map(([k, v]) => ({
    name: clientTypeLabels[k] ?? k,
    value: v,
  }));

  // monthly new clients
  const monthBuckets = last6Months();
  const monthlyData = monthBuckets.map((m) => ({
    month: m.label,
    عملاء_جدد: clients.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length,
  }));

  const statusCounts = {
    نشطون: clients.filter((c) => c.status === "active").length,
    معطّلون: clients.filter((c) => c.status === "inactive").length,
  };
  const statusData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="العملاء حسب النوع" subtitle={`المجموع: ${clients.length}`}>
          {typeData.length === 0 ? (
            <EmptyState icon={PieIcon} text="لا توجد بيانات" />
          ) : (
            <PieBlock data={typeData} />
          )}
        </SectionCard>
        <SectionCard
          title="العملاء الجدد شهرياً"
          subtitle="آخر 6 أشهر"
          className="lg:col-span-2"
        >
          {clients.length === 0 ? (
            <EmptyState icon={LineIcon} text="لا توجد بيانات" />
          ) : (
            <LineBlock data={monthlyData} keys={["عملاء_جدد"]} />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="حالة العملاء" subtitle="نشط/معطّل">
          {statusData.length === 0 ? (
            <EmptyState icon={PieIcon} text="لا توجد بيانات" />
          ) : (
            <PieBlock data={statusData} />
          )}
        </SectionCard>
        <SectionCard
          title="العملاء حسب التعاقد"
          subtitle="نوع التعاقد"
          className="lg:col-span-2"
        >
          <ContractTypeBar />
        </SectionCard>
      </div>
    </div>
  );
}

function ContractTypeBar() {
  const { clients } = useClients();
  const counts = clients.reduce<Record<string, number>>((acc, c) => {
    const k =
      c.contractType === "annual"
        ? "سنوي"
        : c.contractType === "single"
        ? "أحادي"
        : "افتراضي";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
  if (data.length === 0) return <EmptyState icon={BarChart3} text="لا توجد بيانات" />;
  return <BarBlock data={data} />;
}

function PaymentsCharts() {
  const { contracts } = useContracts();

  // by status
  const statusCounts = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([k, v]) => ({
    name: statusLabels[k] ?? k,
    value: v,
  }));

  // monthly revenue
  const monthBuckets = last6Months();
  const monthlyRevenue = monthBuckets.map((m) => {
    const monthContracts = contracts.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    return {
      month: m.label,
      الإيرادات: monthContracts.reduce((s, c) => s + sumServices(c.services), 0),
    };
  });

  // by type (revenue)
  const typeRevenue = contracts.reduce<Record<string, number>>((acc, c) => {
    const k = c.contractType || "—";
    acc[k] = (acc[k] ?? 0) + sumServices(c.services);
    return acc;
  }, {});
  const typeRevenueData = Object.entries(typeRevenue).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="العقود حسب الحالة" subtitle={`المجموع: ${contracts.length}`}>
          {statusData.length === 0 ? (
            <EmptyState icon={PieIcon} text="لا توجد بيانات" />
          ) : (
            <PieBlock data={statusData} />
          )}
        </SectionCard>
        <SectionCard
          title="الإيرادات الشهرية"
          subtitle="آخر 6 أشهر (ر.س)"
          className="lg:col-span-2"
        >
          {contracts.length === 0 ? (
            <EmptyState icon={LineIcon} text="لا توجد بيانات" />
          ) : (
            <LineBlock data={monthlyRevenue} keys={["الإيرادات"]} />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
        <SectionCard title="الإيرادات حسب نوع العقد" subtitle="القيمة الإجمالية (ر.س)">
          {typeRevenueData.length === 0 ? (
            <EmptyState icon={BarChart3} text="لا توجد بيانات" />
          ) : (
            <BarBlock data={typeRevenueData} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ---------- Reusable chart blocks ----------

function PieBlock({ data }: { data: { name: string; value: number }[] }) {
  return (
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
          <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 12 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarBlock({ data }: { data: { name: string; value: number }[] }) {
  return (
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
  );
}

function LineBlock({
  data,
  keys,
}: {
  data: Record<string, string | number>[];
  keys: string[];
}) {
  return (
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
          <Legend wrapperStyle={{ fontFamily: "Tajawal", fontSize: 12 }} iconType="circle" />
          {keys.map((k, idx) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

void TrendingUp; // suppress unused
