import { ChevronDown } from "lucide-react";
import ClientsKpiStrip from "../components/clients/ClientsKpiStrip";
import ClientsToolbar from "../components/clients/ClientsToolbar";
import ClientsTabs from "../components/clients/ClientsTabs";
import ClientsEmpty from "../components/clients/ClientsEmpty";

export default function Clients() {
  return (
    <div className="space-y-5">
      <ClientsKpiStrip />
      <ClientsToolbar />
      <ClientsTabs />

      <div className="flex items-center justify-between">
        <div className="relative">
          <select className="appearance-none pr-8 pl-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-bold text-slate-700">0</span> عميل
        </div>
      </div>

      <ClientsEmpty />
    </div>
  );
}
