import { BarChart2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getInvoices } from "#/modules/invoice/invoice.api";
import { PayoutRow } from "../components/PayoutRow";

type Invoice = {
  id: string;
  projectId: string;
  amount: number;
  status: "PENDING" | "PAID";
  paymentLink: string | null;
  issuedDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  project: { id: string; title: string };
};

function formatMonth(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
}

function formatDay(dateStr: string | null): string {
  if (!dateStr) return "—";
  return String(new Date(dateStr).getDate());
}

export function PayoutSchedule() {
  const getInvoicesFn = useServerFn(getInvoices);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoicesFn()
      .then((data) => {
        const pending = (data as Invoice[]).filter(
          (i) => i !== null && i.status === "PENDING",
        );
        setInvoices(pending.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getInvoicesFn]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart2 size={18} /> Payout Schedule
        </h2>
        <button
          type="button"
          className="text-sm text-gray-100/50 hover:text-gray-100"
        >
          View All
        </button>
      </div>
      {loading ? (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          <div className="py-6 text-sm text-gray-500">Loading payouts...</div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          <div className="py-6 text-sm text-gray-500">No pending payouts.</div>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          {invoices.map((invoice, index) => (
            <PayoutRow
              key={invoice.id}
              month={formatMonth(invoice.issuedDate)}
              day={formatDay(invoice.issuedDate)}
              label={invoice.project.title}
              amount={`$${invoice.amount.toLocaleString()}`}
              last={index === invoices.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
