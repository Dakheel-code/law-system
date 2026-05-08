import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
      <Icon className="w-12 h-12 mb-3" strokeWidth={1.2} />
      <span className="text-sm">{text}</span>
    </div>
  );
}
