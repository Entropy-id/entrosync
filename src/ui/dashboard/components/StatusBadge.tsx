type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

const colorMap: Record<InvoiceStatus, string> = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[status]}`}
    >
      {status}
    </span>
  );
}
