import { z } from "zod";

export const dashboardStatsSchema = z.object({
	totalRevenueYtd: z.number(),
	activeProjects: z.number().int(),
	pendingInvoices: z.number().int(),
	pendingAmount: z.number(),
});

export const activityType = z.enum([
	"MILESTONE_COMPLETED",
	"INVOICE_PAID",
	"INVOICE_ISSUED",
	"PROJECT_CREATED",
	"PROJECT_UPDATED",
	"FEEDBACK_RECEIVED",
	"DOCUMENT_UPLOADED",
	"GENERIC",
]);

export const activityItemSchema = z.object({
	id: z.string(),
	type: activityType,
	title: z.string(),
	description: z.string(),
	time: z.date(),
});

export const recentActivityInputSchema = z.object({
	limit: z.number().int().positive().default(5),
});
