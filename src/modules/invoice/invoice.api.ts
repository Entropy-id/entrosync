import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Prisma } from "#/generated/prisma/client";
import { auth } from "#/modules/auth/auth.utils";
import { toISOString, toNumber } from "#/lib/serialize";
import { prisma } from "#/utils/prisma";
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
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  const invoices = await prisma.invoice.findMany({
    where: { project: { freelancerId: session.user.id } },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { issuedDate: "desc" },
  });
  return invoices.map(serializeInvoice);
});

export const getInvoiceById = createServerFn({ method: "GET" })
  .validator(invoiceByIdSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: data.id,
        project: { freelancerId: session.user.id },
      },
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
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const existing = await prisma.invoice.findFirst({
      where: { id: data.id, project: { freelancerId: session.user.id } },
    });
    if (!existing) throw new Error("Invoice not found");

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
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const existing = await prisma.invoice.findFirst({
      where: { id: data.id, project: { freelancerId: session.user.id } },
    });
    if (!existing) throw new Error("Invoice not found");

    const invoice = await prisma.invoice.delete({
      where: { id: data.id },
      include: { project: { select: { id: true, title: true } } },
    });
    return serializeInvoice(invoice);
  });
