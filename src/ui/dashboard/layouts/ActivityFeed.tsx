import { CheckCircle2, FileText, History, Wallet } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getRecentActivity } from "#/modules/dashboard/dashboard.api";
import { ActivityRow } from "../components/ActivityRow";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type) {
    case "MILESTONE_COMPLETED":
      return <CheckCircle2 size={16} className="text-emerald-400" />;
    case "INVOICE_PAID":
      return <Wallet size={16} className="text-violet-400" />;
    case "INVOICE_ISSUED":
      return <FileText size={16} className="text-sky-400" />;
    default:
      return <History size={16} className="text-gray-400" />;
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case "MILESTONE_COMPLETED":
      return "bg-emerald-500/15";
    case "INVOICE_PAID":
      return "bg-violet-500/15";
    case "INVOICE_ISSUED":
      return "bg-sky-500/15";
    default:
      return "bg-zinc-700/40";
  }
}

export function ActivityFeed() {
  const getActivity = useServerFn(getRecentActivity);
  const [items, setItems] = useState<
    {
      id: string;
      type: string;
      title: string;
      description: string;
      time: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivity()
      .then((data) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getActivity]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History size={18} /> Activity Feed
        </h2>
      </div>
      {loading ? (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          <div className="py-6 text-sm text-gray-500">Loading activity...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          <div className="py-6 text-sm text-gray-500">No recent activity.</div>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-3 sm:px-5 mb-10">
          {items.map((item, index) => (
            <ActivityRow
              key={item.id}
              icon={getActivityIcon(item.type)}
              iconBg={getActivityIconBg(item.type)}
              title={item.title}
              desc={item.description}
              time={timeAgo(item.time)}
              last={index === items.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
