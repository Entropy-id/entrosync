import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  valueClass?: string;
  footer: ReactNode;
  icon: ReactNode;
}
export function StatCard({
  label,
  value,
  valueClass,
  footer,
  icon,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5 flex-1 min-w-50">
      <p className="text-md tracking-wider font-medium">{label}</p>
      <p
        className={`text-3xl font-semibold mt-2 ${valueClass || "text-gray-100"}`}
      >
        {value}
      </p>
      <div className="mt-3 text-xs text-gray-100/30">{footer}</div>
      <div className="absolute right-3 bottom-3 text-zinc-800 opacity-60">
        {icon}
      </div>
    </div>
  );
}
