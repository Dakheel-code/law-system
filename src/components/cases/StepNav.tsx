import { ArrowLeft, ArrowRight, Send } from "lucide-react";

type Props = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
};

export default function StepNav({
  current,
  total,
  onPrev,
  onNext,
  onSubmit,
  submitLabel,
}: Props) {
  const isLast = current === total - 1;
  const isFirst = current === 0;

  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        onClick={isLast ? onSubmit : onNext}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg text-sm font-bold shadow-card hover:bg-brand-600"
      >
        {isLast ? (
          <>
            {submitLabel ?? "إنشاء الطلب"}
            <Send className="w-4 h-4" />
          </>
        ) : (
          <>
            التالي
            <ArrowLeft className="w-4 h-4" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border ${
          isFirst
            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <ArrowRight className="w-4 h-4" />
        السابق
      </button>
    </div>
  );
}
