import { useState } from "react";
import { InvoiceDetail } from "./InvoiceDetail";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { InvoiceList } from "./InvoiceList";

type SubView = "list" | "detail" | "generator";

interface InvoicesSectionProps {
  initialSubView?: SubView;
}

export function InvoicesSection({
  initialSubView = "list",
}: InvoicesSectionProps) {
  const [subView, setSubView] = useState<SubView>(initialSubView);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const [prevInitial, setPrevInitial] = useState(initialSubView);
  if (initialSubView !== prevInitial) {
    setPrevInitial(initialSubView);
    setSubView(initialSubView);
  }

  if (subView === "detail" && selectedInvoiceId) {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoiceId}
        onBack={() => setSubView("list")}
      />
    );
  }

  if (subView === "generator") {
    return (
      <InvoiceGenerator
        onBack={() => setSubView("list")}
        onGenerated={(id) => {
          setSelectedInvoiceId(id);
          setSubView("detail");
        }}
      />
    );
  }

  return (
    <InvoiceList
      onSelectInvoice={(id) => {
        setSelectedInvoiceId(id);
        setSubView("detail");
      }}
      onGenerate={() => setSubView("generator")}
    />
  );
}
