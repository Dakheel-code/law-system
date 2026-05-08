import { Check } from "lucide-react";

export type HStep = { title: string };

type Props = {
  steps: HStep[];
  current: number;
  onJump?: (i: number) => void;
};

export default function HStepper({ steps, current, onJump }: Props) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-2 flex-row-reverse">
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const canJump = i <= current && onJump;
        return (
          <li key={i} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onJump?.(i)}
              className={`flex items-center gap-2 ${canJump ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`text-sm font-bold ${
                  isActive
                    ? "text-brand-700"
                    : isDone
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {s.title}
              </span>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  isActive
                    ? "bg-brand-500 text-white border-brand-500"
                    : isDone
                    ? "bg-white text-brand-600 border-brand-500"
                    : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={`w-8 h-px mx-1 ${isDone ? "bg-brand-500" : "bg-slate-200"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
