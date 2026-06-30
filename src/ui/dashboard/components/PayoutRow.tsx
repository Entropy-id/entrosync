interface PayoutRowProps {
  day: string;
  month: string;
  label: string;
  amount: string;
  last?: boolean;
}
export function PayoutRow({ day, month, label, amount, last }: PayoutRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-4 ${
        !last ? "border-b border-zinc-800/80" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-neutral-800 flex flex-col items-center justify-center leading-none">
          <span className="text-[9px] text-gray-100 tracking-wide">
            {month}
          </span>
          <span className="text-sm font-semibold">{day}</span>
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-emerald-400">{amount}</span>
    </div>
  );
}
