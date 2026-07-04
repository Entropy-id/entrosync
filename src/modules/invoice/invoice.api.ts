import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/db";
import { toISOString, toNumber } from "#/lib/serialize";
import {
  createInvoiceSchema,
  invoiceByIdSchema,
  updateInvoiceStatusSchema,
} from "./invoice.schema";

type InvoiceWithProject = Prisma.InvoiceGetPayload<{
  include: { project: { select: { id: true; title: true } } };
}>;

function serializeInvoice(invoice: InvoiceWithProject | null) {
  if (!invoice) return null;
  return {
    id: invoice.id,
    projectId: invoice.projectId,
    amount: toNumber(invoice.amount),
    status: invoice.status,
    paymentLink: invoice.paymentLink,
    issuedDate: toISOString(invoice.issuedDate),
    createdAt: toISOString(invoice.createdAt),
    updatedAt: toISOString(invoice.updatedAt),
    project: invoice.project,
  };
}

export const getInvoices = createServerFn({
  method: "GET",
}).handler(async () => {
  const invoices = await prisma.invoice.findMany({
    include: { project: { select: { id: true, title: true } } },
    orderBy: { issuedDate: "desc" },
  });
  return invoices.map(serializeInvoice);
});

export const getInvoiceById = createServerFn({ method: "GET" })
  .validator(invoiceByIdSchema)
  .handler(async ({ data }) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.id },
      include: { project: { select: { id: true, title: true } } },
    });
    return serializeInvoice(invoice);
  });

export const createInvoice = createServerFn({ method: "POST" })
  .validator(createInvoiceSchema)
  .handler(async ({ data }) => {
    const invoice = await prisma.invoice.create({
      data,
      include: { project: { select: { id: true, title: true } } },
    });
    return serializeInvoice(invoice);
  });

export const updateInvoiceStatus = createServerFn({ method: "POST" })
  .validator(updateInvoiceStatusSchema)
  .handler(async ({ data }) => {
    const invoice = await prisma.invoice.update({
      where: { id: data.id },
      data: { status: data.status },
      include: { project: { select: { id: true, title: true } } },
    });
    return serializeInvoice(invoice);
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .validator(invoiceByIdSchema)
  .handler(async ({ data }) => {
    const invoice = await prisma.invoice.delete({
      where: { id: data.id },
      include: { project: { select: { id: true, title: true } } },
    });
    return serializeInvoice(invoice);
  });
