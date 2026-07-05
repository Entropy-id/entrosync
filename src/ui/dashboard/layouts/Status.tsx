import {
  Clock,
  FileText,
  Folder,
  Rocket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getDashboardStats } from "#/modules/dashboard/dashboard.api";
import { StatCard } from "../components/StatCard";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Status() {
  const getStats = useServerFn(getDashboardStats);
  const [stats, setStats] = useState<{
    totalRevenueYtd: number;
    activeProjects: number;
    pendingInvoices: number;
    pendingAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5 h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
      <StatCard
        label="TOTAL REVENUE (YTD)"
        value={stats ? formatCurrency(stats.totalRevenueYtd) : "$0.00"}
        footer={
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp size={13} /> +12.5% from last month
          </span>
        }
        icon={<Wallet size={56} />}
      />
      <StatCard
        label="ACTIVE PROJECTS"
        value={stats ? String(stats.activeProjects) : "0"}
        footer={
          <span className="flex items-center gap-1">
            <Rocket size={13} /> 3 reaching milestone this week
          </span>
        }
        icon={<Folder size={56} />}
      />
      <StatCard
        label="PENDING INVOICES"
        value={stats ? String(stats.pendingInvoices).padStart(2, "0") : "00"}
        valueClass="text-emerald-400"
        footer={
          <span className="flex items-center gap-1">
            <Clock size={13} />{" "}
            {stats ? formatCurrency(stats.pendingAmount) : "$0.00"} outstanding
          </span>
        }
        icon={<FileText size={56} />}
      />
    </div>
  );
}
