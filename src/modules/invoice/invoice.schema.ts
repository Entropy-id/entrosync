import { z } from "zod";

export const InvoiceStatus = z.enum(["PENDING", "PAID"]);

export const createInvoiceSchema = z.object({
	projectId: z.string().uuid(),
	amount: z.number().positive("Amount must be positive"),
	issuedDate: z.coerce.date(),
	paymentLink: z.string().url().optional(),
});

export const updateInvoiceStatusSchema = z.object({
	id: z.string().uuid(),
	status: InvoiceStatus,
});

export const invoiceByIdSchema = z.object({
	id: z.string().uuid(),
});
