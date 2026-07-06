import { useServerFn } from "@tanstack/react-start";
import { FileText, PlusCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getInvoices,
  type SerializedInvoice,
} from "#/modules/invoice/invoice.api";
import { InvoiceDownloadButton } from "#/ui/invoice/components/InvoiceDownloadButton";
import { StatusBadge } from "../components/StatusBadge";

interface InvoiceListProps {
  onSelectInvoice: (id: string) => void;
  onGenerate: () => void;
}

function isThisMonth(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

function isOverdue(invoice: SerializedInvoice): boolean {
  if (invoice.status !== "PENDING" || !invoice.issuedDate) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(invoice.issuedDate) < thirtyDaysAgo;
}

function PageHeader({ onGenerate }: { onGenerate: () => void }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Invoices</h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage and track your invoices
        </p>
      </div>
      <button
        type="button"
        onClick={onGenerate}
        className="bg-white text-black text-sm font-bold rounded-full px-5 py-2.5 flex items-center gap-2 hover:bg-zinc-200 transition-colors"
      >
        <PlusCircle size={16} strokeWidth={2.5} />
        New Invoice
      </button>
    </header>
  );
}

function SummaryCards({
  totalOutstanding,
  outstandingPercent,
  paidThisMonth,
  overdueCount,
}: {
  totalOutstanding: number;
  outstandingPercent: number;
  paidThisMonth: number;
  overdueCount: number;
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5">
        <p className="text-xs tracking-wider font-medium text-gray-400 mb-2">
          TOTAL OUTSTANDING
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold">
            ${totalOutstanding.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-400 flex items-center gap-0.5">
            <TrendingUp size={13} strokeWidth={2.5} />
            {outstandingPercent}%
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5">
        <p className="text-xs tracking-wider font-medium text-gray-400 mb-2">
          PAID THIS MONTH
        </p>
        <p className="text-2xl font-semibold">
          ${paidThisMonth.toLocaleString()}
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5">
        <p className="text-xs tracking-wider font-medium text-gray-400 mb-2">
          OVERDUE COUNT
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-2xl font-semibold text-red-400">{overdueCount}</p>
          <span className="text-sm text-gray-500">Invoices</span>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-12 text-center">
      <FileText size={40} className="mx-auto text-gray-600 mb-4" />
      <p className="text-gray-400 font-medium">No invoices yet</p>
      <p className="text-gray-500 text-sm mt-1">
        Create your first invoice to get started
      </p>
    </section>
  );
}

function LoadingState() {
  return (
    <section className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Loading invoices...
    </section>
  );
}

function InvoiceTable({
  invoices,
  onSelectInvoice,
}: {
  invoices: SerializedInvoice[];
  onSelectInvoice: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl bg-zinc-900/50 border border-neutral-800 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800">
            <TableHead>INVOICE ID</TableHead>
            <TableHead>PROJECT</TableHead>
            <TableHead>AMOUNT</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ISSUED</TableHead>
            <TableHead>{null}</TableHead>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              onClick={() => onSelectInvoice(invoice.id)}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  if (children === null) {
    return <th className="text-right py-3.5 px-5" />;
  }
  return (
    <th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
      {children}
    </th>
  );
}

function InvoiceRow({
  invoice,
  onClick,
}: {
  invoice: SerializedInvoice;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-neutral-800/50 hover:bg-zinc-800/40 cursor-pointer transition-colors"
    >
      <td className="py-3.5 px-5 font-mono text-xs text-gray-400">
        #{invoice.id.slice(0, 8)}...
      </td>
      <td className="py-3.5 px-5 font-medium">{invoice.project.title}</td>
      <td className="py-3.5 px-5">${invoice.amount.toLocaleString()}</td>
      <td className="py-3.5 px-5">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="py-3.5 px-5 text-gray-400">
        {invoice.issuedDate
          ? new Date(invoice.issuedDate).toLocaleDateString()
          : "—"}
      </td>
      <td className="py-3.5 px-5 text-right">
        <span onClick={(e) => e.stopPropagation()} className="inline-block">
          <InvoiceDownloadButton
            id={invoice.id}
            amount={invoice.amount}
            status={invoice.status}
            issuedDate={invoice.issuedDate}
            projectTitle={invoice.project.title}
            freelancerName={invoice.project.freelancerName ?? undefined}
            size="sm"
          />
        </span>
      </td>
    </tr>
  );
}

export function InvoiceList({ onSelectInvoice, onGenerate }: InvoiceListProps) {
  const getInvoicesHandler = useServerFn(getInvoices);
  const [invoices, setInvoices] = useState<SerializedInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoicesHandler()
      .then((data) =>
        setInvoices(data.filter((i): i is SerializedInvoice => i !== null)),
      )
      .finally(() => setLoading(false));
  }, [getInvoicesHandler]);

  if (loading) return <LoadingState />;

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalBilled = totalOutstanding + totalPaid;
  const outstandingPercent =
    totalBilled > 0 ? Math.round((totalOutstanding / totalBilled) * 100) : 0;

  const paidThisMonth = invoices
    .filter((inv) => inv.status === "PAID" && isThisMonth(inv.issuedDate))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter(isOverdue).length;

  return (
    <div className="space-y-6">
      <PageHeader onGenerate={onGenerate} />
      <SummaryCards
        totalOutstanding={totalOutstanding}
        outstandingPercent={outstandingPercent}
        paidThisMonth={paidThisMonth}
        overdueCount={overdueCount}
      />
      {invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <InvoiceTable invoices={invoices} onSelectInvoice={onSelectInvoice} />
      )}
    </div>
  );
}
