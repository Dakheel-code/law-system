import { Link } from "react-router-dom";
import { Plus, SlidersHorizontal, Search, X } from "lucide-react";

export type ClientsAdvancedFilters = {
  clientType: string;   // "all" | "individual" | "private" | ...
  contractType: string; // "all" | "default" | "single" | "annual"
  hasAttachments: string; // "all" | "yes" | "no"
};

export const defaultAdvancedFilters: ClientsAdvancedFilters = {
  clientType: "all",
  contractType: "all",
  hasAttachments: "all",
};

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  advancedFilters: ClientsAdvancedFilters;
  onAdvancedChange: (patch: Partial<ClientsAdvancedFilters>) => void;
  onResetAdvanced: () => void;
};

const clientTypes = [
  { value: "all", label: "كل الأنواع" },
  { value: "individual", label: "فرد" },
  { value: "private", label: "قطاع خاص" },
  { value: "institution", label: "مؤسسة" },
  { value: "government", label: "جهة حكومية" },
  { value: "semi-government", label: "شبه حكومية" },
];

const contractTypes = [
  { value: "all", label: "كل التعاقدات" },
  { value: "default", label: "افتراضي" },
  { value: "single", label: "أحادي" },
  { value: "annual", label: "سنوي" },
];

const attachmentOptions = [
  { value: "all", label: "الكل" },
  { value: "yes", label: "بمرفقات" },
  { value: "no", label: "بدون مرفقات" },
];

export default function ClientsToolbar({
  search,
  onSearchChange,
  filtersOpen,
  onToggleFilters,
  advancedFilters,
  onAdvancedChange,
  onResetAdvanced,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row-reverse items-stretch lg:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، رقم الهوية، الهاتف، البريد..."
            className="w-full pr-11 pl-10 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 text-slate-400"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onToggleFilters}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm shadow-card transition ${
            filtersOpen
              ? "bg-brand-500 text-white border border-brand-500"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          فلاتر
        </button>

        <Link
          to="/clients/new"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold shadow-card hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          عميل جديد
        </Link>
      </div>

      {filtersOpen && (
        <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <FilterSelect
            label="نوع العميل"
            value={advancedFilters.clientType}
            options={clientTypes}
            onChange={(v) => onAdvancedChange({ clientType: v })}
          />
          <FilterSelect
            label="نوع التعاقد"
            value={advancedFilters.contractType}
            options={contractTypes}
            onChange={(v) => onAdvancedChange({ contractType: v })}
          />
          <FilterSelect
            label="المرفقات"
            value={advancedFilters.hasAttachments}
            options={attachmentOptions}
            onChange={(v) => onAdvancedChange({ hasAttachments: v })}
          />
          <button
            onClick={onResetAdvanced}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-200 text-right"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
