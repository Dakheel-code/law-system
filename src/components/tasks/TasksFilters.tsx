import { Search, RotateCcw, Calendar } from "lucide-react";
import { useUsers } from "../../lib/userStore";
import {
  defaultTasksFilters,
  type TasksFiltersState,
} from "./filterTypes";

type Props = {
  filters: TasksFiltersState;
  onChange: (patch: Partial<TasksFiltersState>) => void;
  onReset: () => void;
};

const sortOptions = [
  { value: "none", label: "بدون ترتيب" },
  { value: "date-asc", label: "الأقدم أولاً" },
  { value: "date-desc", label: "الأحدث أولاً" },
];

const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "todo", label: "جديد" },
  { value: "doing", label: "قيد التنفيذ" },
  { value: "review", label: "قيد المراجعة" },
  { value: "done", label: "مكتملة" },
  { value: "overdue", label: "متأخرة" },
  { value: "cancelled", label: "ملغاة" },
];

const priorityOptions = [
  { value: "all", label: "كل الأولويات" },
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجلة" },
];

// Convert ISO YYYY-MM-DD (greg) to Hijri YYYY-MM-DD string for display
const isoToHijri = (iso: string): string => {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value ?? "";
    const m = parts.find((p) => p.type === "month")?.value ?? "";
    const dd = parts.find((p) => p.type === "day")?.value ?? "";
    return `${y}/${m}/${dd}`;
  } catch {
    return iso;
  }
};

export default function TasksFilters({ filters, onChange, onReset }: Props) {
  const { users } = useUsers();

  const assigneeOptions = [
    { value: "all", label: "كل المكلفين" },
    ...users.map((u) => ({ value: u.id, label: u.fullName || u.code })),
  ];

  const isHijri = filters.calendar === "hijri";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-3 py-2.5 bg-rose-50 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 shrink-0"
      >
        <RotateCcw className="w-4 h-4" />
        إعادة تعيين
      </button>

      <DateInput
        label="من"
        value={filters.dateFrom}
        onChange={(v) => onChange({ dateFrom: v })}
        isHijri={isHijri}
        placeholder="من تاريخ"
      />
      <DateInput
        label="إلى"
        value={filters.dateTo}
        onChange={(v) => onChange({ dateTo: v })}
        isHijri={isHijri}
        placeholder="إلى تاريخ"
      />

      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
        <button
          onClick={() => onChange({ calendar: "hijri" })}
          className={`px-3 py-1.5 rounded-md text-sm transition ${
            filters.calendar === "hijri" ? "bg-brand-500 text-white" : "text-slate-500"
          }`}
        >
          هجري
        </button>
        <button
          onClick={() => onChange({ calendar: "greg" })}
          className={`px-3 py-1.5 rounded-md text-sm transition ${
            filters.calendar === "greg" ? "bg-brand-500 text-white" : "text-slate-500"
          }`}
        >
          ميلادي
        </button>
      </div>

      <FilterSelect
        value={filters.sort}
        options={sortOptions}
        onChange={(v) => onChange({ sort: v as TasksFiltersState["sort"] })}
      />
      <FilterSelect
        value={filters.assignee}
        options={assigneeOptions}
        onChange={(v) => onChange({ assignee: v })}
      />
      <FilterSelect
        value={filters.status}
        options={statusOptions}
        onChange={(v) => onChange({ status: v })}
      />
      <FilterSelect
        value={filters.priority}
        options={priorityOptions}
        onChange={(v) => onChange({ priority: v })}
      />

      <div className="relative flex-1 min-w-[150px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="بحث في العنوان والوصف..."
          className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </div>
  );
}

function DateInput({
  value,
  onChange,
  isHijri,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isHijri: boolean;
  placeholder: string;
}) {
  // Date inputs always operate on Gregorian ISO; the toggle only affects what we show.
  const hijriHint = isHijri && value ? ` (${isoToHijri(value)} هـ)` : "";
  return (
    <div className="relative min-w-[160px]">
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={value ? `${value}${hijriHint}` : placeholder}
        placeholder={placeholder}
        className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export { defaultTasksFilters };
