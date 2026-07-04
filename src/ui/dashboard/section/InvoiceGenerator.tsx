import { createInvoice } from "#/modules/invoice/invoice.api";
import { getProjects } from "#/modules/project/project.api";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState } from "react";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

interface InvoiceGeneratorProps {
  onBack: () => void;
  onGenerated: (invoiceId: string) => void;
}

function FormHeader() {
  return (
    <header className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-zinc-800">
        <FileText size={20} className="text-gray-300" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Generate Invoice</h2>
        <p className="text-sm text-gray-400">
          Fill in the details to create a new invoice
        </p>
      </div>
    </header>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <aside
      role="alert"
      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
    >
      {message}
    </aside>
  );
}

function FormField({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1.5"
      >
        {label}{" "}
        {optional && (
          <span className="text-gray-500 font-normal">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-zinc-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-neutral-500 transition-colors";

function ProjectSelect({
  value,
  onChange,
  projects,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  projects: Project[];
  loading: boolean;
}) {
  return (
    <FormField id="project" label="Project">
      {loading ? (
        <div className="text-sm text-gray-500 py-2">Loading projects...</div>
      ) : (
        <select
          id="project"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}

function AmountInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField id="amount" label="Amount ($)">
      <input
        id="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 1500.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </FormField>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField id="issuedDate" label="Issue Date">
      <input
        id="issuedDate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </FormField>
  );
}

function PaymentLinkInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField id="paymentLink" label="Payment Link" optional>
      <input
        id="paymentLink"
        type="url"
        placeholder="https://pay.example.com/invoice/123"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </FormField>
  );
}

function FormActions({
  submitting,
  loadingProjects,
  onCancel,
}: {
  submitting: boolean;
  loadingProjects: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={submitting || loadingProjects}
        className="bg-white text-black text-sm font-medium rounded-xl px-6 py-2.5 flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create Invoice"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2.5"
      >
        Cancel
      </button>
    </div>
  );
}

export function InvoiceGenerator({ onBack, onGenerated }: InvoiceGeneratorProps) {
  const getProjectsHandler = useServerFn(getProjects);
  const createInvoiceHandler = useServerFn(createInvoice);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentLink, setPaymentLink] = useState("");

  useEffect(() => {
    getProjectsHandler()
      .then(setProjects)
      .finally(() => setLoadingProjects(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!projectId) {
      setError("Please select a project.");
      return;
    }
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!issuedDate) {
      setError("Please select an issue date.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createInvoiceHandler({
        data: {
          projectId,
          amount: Number.parseFloat(amount),
          issuedDate: new Date(issuedDate),
          paymentLink: paymentLink.trim() || undefined,
        },
      });
      if (result) {
        onGenerated(result.id);
      }
    } catch {
      setError("Failed to create invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Invoices
      </button>

      <div className="max-w-xl">
        <section className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-6">
          <FormHeader />

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <ProjectSelect
              value={projectId}
              onChange={setProjectId}
              projects={projects}
              loading={loadingProjects}
            />
            <AmountInput value={amount} onChange={setAmount} />
            <DateInput value={issuedDate} onChange={setIssuedDate} />
            <PaymentLinkInput
              value={paymentLink}
              onChange={setPaymentLink}
            />
            <FormActions
              submitting={submitting}
              loadingProjects={loadingProjects}
              onCancel={onBack}
            />
          </form>
        </section>
      </div>
    </div>
  );
}
