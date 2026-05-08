import { Info } from "lucide-react";

export default function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-right">
      <h2 className="flex items-center justify-end gap-2 text-xl font-extrabold text-slate-800">
        {title}
        <Info className="w-4 h-4 text-brand-500" />
      </h2>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
