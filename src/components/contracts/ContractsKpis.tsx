type KPI = {
  title: string;
  value: string;
  color: string;
};

const items: KPI[] = [
  { title: "إجمالي التعاقدات", value: "0", color: "text-slate-700" },
  { title: "نشط", value: "0", color: "text-slate-700" },
  { title: "ينتهي قريباً", value: "0", color: "text-rose-600" },
  { title: "إجمالي القيمة (ر.س)", value: "0.00", color: "text-emerald-600" },
  { title: "المحصل (ر.س)", value: "0.00", color: "text-violet-600" },
];

export default function ContractsKpis() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((it) => (
        <div key={it.title} className="card px-4 py-5 text-center">
          <div className={`text-3xl font-extrabold ${it.color}`}>{it.value}</div>
          <div className="text-xs text-slate-500 mt-1">{it.title}</div>
        </div>
      ))}
    </div>
  );
}
