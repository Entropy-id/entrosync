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

export const getInvoiceById = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const { id } = invoiceByIdSchema.parse(data);
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: { select: { id: true, title: true } } },
  });
  return serializeInvoice(invoice);
});

export const createInvoice = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = createInvoiceSchema.parse(data);
  const invoice = await prisma.invoice.create({
    data: parsed,
    include: { project: { select: { id: true, title: true } } },
  });
  return serializeInvoice(invoice);
});

export const updateInvoiceStatus = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { id, status } = updateInvoiceStatusSchema.parse(data);
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
    include: { project: { select: { id: true, title: true } } },
  });
  return serializeInvoice(invoice);
});

export const deleteInvoice = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { id } = invoiceByIdSchema.parse(data);
  const invoice = await prisma.invoice.delete({
    where: { id },
    include: { project: { select: { id: true, title: true } } },
  });
  return serializeInvoice(invoice);
});
