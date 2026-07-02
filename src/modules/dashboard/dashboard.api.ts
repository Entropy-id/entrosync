import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { recentActivityInputSchema } from "./dashboard.schema";

function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  if (
    typeof value === "object" &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

function mapLogActionToType(action: string) {
  switch (action) {
    case "MILESTONE_COMPLETED":
      return "MILESTONE_COMPLETED";
    case "INVOICE_PAID":
      return "INVOICE_PAID";
    case "INVOICE_ISSUED":
      return "INVOICE_ISSUED";
    case "PROJECT_CREATED":
      return "PROJECT_CREATED";
    case "PROJECT_UPDATED":
      return "PROJECT_UPDATED";
    case "FEEDBACK_RECEIVED":
      return "FEEDBACK_RECEIVED";
    case "DOCUMENT_UPLOADED":
      return "DOCUMENT_UPLOADED";
    default:
      return "GENERIC";
  }
}

export const getDashboardStats = createServerFn({
  method: "GET",
}).handler(async () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

  const [paidInvoicesYtd, activeProjects, pendingInvoices] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        issuedDate: { gte: startOfYear, lt: endOfYear },
      },
      _sum: { amount: true },
    }),
    prisma.project.count({ where: { status: "ON_PROGRESS" } }),
    prisma.invoice.aggregate({
      where: { status: "PENDING" },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalRevenueYtd: decimalToNumber(paidInvoicesYtd._sum.amount),
    activeProjects,
    pendingInvoices: pendingInvoices._count.id,
    pendingAmount: decimalToNumber(pendingInvoices._sum.amount),
  };
});

export const getRecentActivity = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const { limit } = recentActivityInputSchema.parse(data ?? {});

  const logs = await prisma.projectLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { project: { select: { title: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    type: mapLogActionToType(log.action),
    title: log.action.replace(/_/g, " "),
    description:
      log.description ||
      `Activity recorded for ${log.project?.title || "project"}`,
    time: log.createdAt.toISOString(),
  }));
});
