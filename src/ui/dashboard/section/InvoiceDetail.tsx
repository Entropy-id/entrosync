import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getInvoiceById,
  updateInvoiceStatus,
  type SerializedInvoice,
} from "#/modules/invoice/invoice.api";
import { StatusBadge } from "../components/StatusBadge";

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
    >
      <ArrowLeft size={16} />
      Back to Invoices
    </button>
  );
}

function InvoiceHeader({
  invoice,
  updating,
  onMarkAsPaid,
  onMarkAsPending,
}: {
  invoice: SerializedInvoice;
  updating: boolean;
  onMarkAsPaid: () => void;
  onMarkAsPending: () => void;
}) {
  return (
    <header className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-wider font-medium text-gray-400 mb-1">
            INVOICE
          </p>
          <h2 className="text-lg font-mono text-gray-300">
            #{invoice.id.slice(0, 8)}...
          </h2>
          <p className="text-sm text-gray-500 mt-1">{invoice.project.title}</p>
        </div>
        <StatusAction
          status={invoice.status}
          updating={updating}
          onMarkAsPaid={onMarkAsPaid}
          onMarkAsPending={onMarkAsPending}
        />
      </div>
    </header>
  );
}

function StatusAction({
  status,
  updating,
  onMarkAsPaid,
  onMarkAsPending,
}: {
  status: string;
  updating: boolean;
  onMarkAsPaid: () => void;
  onMarkAsPending: () => void;
}) {
  if (status === "PENDING") {
    return (
      <button
        type="button"
        onClick={onMarkAsPaid}
        disabled={updating}
        className="bg-emerald-600 text-white text-sm font-medium rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50"
      >
        <CheckCircle size={16} />
        {updating ? "Updating..." : "Mark as Paid"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onMarkAsPending}
      disabled={updating}
      className="bg-zinc-700 text-white text-sm font-medium rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-zinc-600 transition-colors disabled:opacity-50"
    >
      {updating ? "Updating..." : "Mark as Pending"}
    </button>
  );
}

function DetailGrid({ invoice }: { invoice: SerializedInvoice }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DetailCard label="AMOUNT">
        <p className="text-3xl font-semibold mt-2">
          ${invoice.amount.toLocaleString()}
        </p>
      </DetailCard>

      <DetailCard label="STATUS">
        <div className="mt-2">
          <StatusBadge status={invoice.status} />
        </div>
      </DetailCard>

      <DetailCard label="ISSUED DATE">
        <p className="text-lg font-medium mt-2">
          {invoice.issuedDate
            ? new Date(invoice.issuedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—"}
        </p>
      </DetailCard>

      <DetailCard label="PAYMENT LINK">
        {invoice.paymentLink ? (
          <a
            href={invoice.paymentLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Pay Invoice
            <ExternalLink size={14} />
          </a>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No payment link set</p>
        )}
      </DetailCard>
    </section>
  );
}

function DetailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5">
      <p className="text-xs tracking-wider font-medium text-gray-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function TimestampFooter({ invoice }: { invoice: SerializedInvoice }) {
  return (
    <footer className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5">
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
        <p>
          Created:{" "}
          <span className="text-gray-300">
            {invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleString()
              : "—"}
          </span>
        </p>
        <p>
          Updated:{" "}
          <span className="text-gray-300">
            {invoice.updatedAt
              ? new Date(invoice.updatedAt).toLocaleString()
              : "—"}
          </span>
        </p>
      </div>
    </footer>
  );
}

function LoadingState() {
  return (
    <section className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Loading invoice...
    </section>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <section className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-12 text-center">
      <p className="text-gray-400 font-medium">Invoice not found</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 text-sm text-white underline"
      >
        Back to invoices
      </button>
    </section>
  );
}

export function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const getInvoiceByIdHandler = useServerFn(getInvoiceById);
  const updateStatusHandler = useServerFn(updateInvoiceStatus);
  const [invoice, setInvoice] = useState<SerializedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInvoice = useCallback(() => {
    setLoading(true);
    getInvoiceByIdHandler({ data: { id: invoiceId } })
      .then((data) => setInvoice(data))
      .finally(() => setLoading(false));
  }, [getInvoiceByIdHandler, invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  async function handleMarkAsPaid() {
    if (!invoice) return;
    setUpdating(true);
    await updateStatusHandler({
      data: { id: invoice.id, status: "PAID" },
    });
    await fetchInvoice();
    setUpdating(false);
  }

  async function handleMarkAsPending() {
    if (!invoice) return;
    setUpdating(true);
    await updateStatusHandler({
      data: { id: invoice.id, status: "PENDING" },
    });
    await fetchInvoice();
    setUpdating(false);
  }

  if (loading) return <LoadingState />;
  if (!invoice) return <NotFoundState onBack={onBack} />;

  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <InvoiceHeader
        invoice={invoice}
        updating={updating}
        onMarkAsPaid={handleMarkAsPaid}
        onMarkAsPending={handleMarkAsPending}
      />
      <DetailGrid invoice={invoice} />
      <TimestampFooter invoice={invoice} />
    </div>
  );
}
