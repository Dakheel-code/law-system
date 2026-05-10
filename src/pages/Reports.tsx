import { useState } from "react";
import { Info } from "lucide-react";
import InfoBanner from "../components/ui/InfoBanner";
import ReportsHeader from "../components/reports/ReportsHeader";
import ReportsTabs from "../components/reports/ReportsTabs";
import ReportsKpis, { ReportsMiniStats } from "../components/reports/ReportsKpis";
import ReportsCharts from "../components/reports/ReportsCharts";

export default function Reports() {
  const [tab, setTab] = useState("requests");

  return (
    <div className="space-y-5">
      <InfoBanner
        icon={Info}
        title="التقارير والإحصائيات"
        description="تقارير شاملة عن أداء المكتب تشمل الطلبات والقضايا والعملاء والمدفوعات والمهام."
      />

      <ReportsHeader />

      <div className="card">
        <ReportsTabs active={tab} onChange={setTab} />
        <div className="p-5 space-y-5">
          <ReportsKpis tab={tab} />
          <ReportsMiniStats tab={tab} />
          <ReportsCharts tab={tab} />
        </div>
      </div>
    </div>
  );
}
