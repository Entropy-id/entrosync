import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/modules/auth/auth.utils";
import { prisma } from "#/utils/prisma";
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
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

  const [paidInvoicesYtd, activeProjects, pendingInvoices] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        issuedDate: { gte: startOfYear, lt: endOfYear },
        project: { freelancerId: session.user.id },
      },
      _sum: { amount: true },
    }),
    prisma.project.count({
      where: { status: "ON_PROGRESS", freelancerId: session.user.id },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "PENDING",
        project: { freelancerId: session.user.id },
      },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
  );
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [thisMonthRevenue, lastMonthRevenue, milestonesThisWeek] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          issuedDate: { gte: startOfMonth },
          project: { freelancerId: session.user.id },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          issuedDate: { gte: startOfLastMonth, lt: endOfLastMonth },
          project: { freelancerId: session.user.id },
        },
        _sum: { amount: true },
      }),
      prisma.milestone.count({
        where: {
          dueDate: { gte: startOfWeek, lt: endOfWeek },
          status: { not: "DONE" },
          project: { freelancerId: session.user.id, status: "ON_PROGRESS" },
        },
      }),
    ]);

  const thisMonth = decimalToNumber(thisMonthRevenue._sum.amount);
  const lastMonth = decimalToNumber(lastMonthRevenue._sum.amount);
  const revenueGrowthPercent =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    totalRevenueYtd: decimalToNumber(paidInvoicesYtd._sum.amount),
    activeProjects,
    pendingInvoices: pendingInvoices._count.id,
    pendingAmount: decimalToNumber(pendingInvoices._sum.amount),
    revenueGrowthPercent,
    milestonesThisWeek,
  };
});

export const getRecentActivity = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  const { limit } = recentActivityInputSchema.parse(data ?? {});

  const logs = await prisma.projectLog.findMany({
    where: { project: { freelancerId: session.user.id } },
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
