type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

export default function Toggle({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-brand-500" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 ${
          checked ? "left-5" : "left-0.5"
        } w-5 h-5 bg-white rounded-full shadow transition-all`}
      />
    </button>
  );
}
