import { RotateCcw, Search } from "lucide-react";
import { useUsers } from "../../lib/userStore";
import {
  defaultFilters,
  type AppointmentFilters,
} from "./filtersTypes";

type Props = {
  filters: AppointmentFilters;
  onChange: (patch: Partial<AppointmentFilters>) => void;
  onReset: () => void;
};

const statusOptions = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد التنفيذ" },
  { value: "overdue", label: "متأخرة" },
  { value: "completed", label: "مكتملة" },
];

const periodOptions = [
  { value: "all", label: "كل الفترات" },
  { value: "today", label: "اليوم" },
  { value: "week", label: "هذا الأسبوع" },
  { value: "month", label: "هذا الشهر" },
];

const typeOptions = [
  { value: "all", label: "الكل" },
  { value: "task", label: "مهام" },
  { value: "case", label: "قضايا/جلسات" },
];

export default function FilterBar({ filters, onChange, onReset }: Props) {
  const { users } = useUsers();

  const lawyerOptions = [
    { value: "all", label: "الكل" },
    ...users.map((u) => ({ value: u.id, label: u.fullName || u.code })),
  ];

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
            بحث
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="بحث في العنوان والوصف..."
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>

        <FilterSelect
          label="المحامي/الموظف"
          value={filters.lawyer}
          options={lawyerOptions}
          onChange={(v) => onChange({ lawyer: v })}
        />
        <FilterSelect
          label="الحالة"
          value={filters.status}
          options={statusOptions}
          onChange={(v) => onChange({ status: v })}
        />
        <FilterSelect
          label="الفترة"
          value={filters.period}
          options={periodOptions}
          onChange={(v) => onChange({ period: v })}
        />
        <FilterSelect
          label="النوع"
          value={filters.type}
          options={typeOptions}
          onChange={(v) => onChange({ type: v })}
        />

        <div className="lg:col-span-1 flex justify-start">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-start gap-4 text-xs text-slate-500 flex-wrap">
        <span className="font-bold text-slate-600">أنواع المواعيد:</span>
        <Legend color="bg-emerald-500" label="جلسات قضايا" />
        <Legend color="bg-violet-500" label="مهام" />
      </div>
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

export { defaultFilters };
