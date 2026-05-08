import { Check } from "lucide-react";

export type Step = { title: string; description: string };

type Props = {
  steps: Step[];
  current: number;
  onJump?: (i: number) => void;
};

export default function Stepper({ steps, current, onJump }: Props) {
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const canJump = i <= current && onJump;
        return (
          <li key={i} className="relative">
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onJump?.(i)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-right transition ${
                isActive ? "bg-brand-50" : "hover:bg-slate-50"
              } ${canJump ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex-1">
                <div
                  className={`text-sm font-bold ${
                    isActive
                      ? "text-brand-700"
                      : isDone
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{s.description}</div>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border-2 ${
                  isActive
                    ? "bg-brand-500 text-white border-brand-500"
                    : isDone
                    ? "bg-white text-brand-600 border-brand-500"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`absolute right-[27px] top-12 w-px h-4 ${
                  isDone ? "bg-brand-500" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
