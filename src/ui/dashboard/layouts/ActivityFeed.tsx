import { CheckCircle2, History, Wallet } from "lucide-react";
import { ActivityRow } from "../components/ActivityRow";
export function ActivityFeed() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History size={18} /> Activity Feed
        </h2>
      </div>
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-5 mb-10">
        <ActivityRow
          icon={<CheckCircle2 size={16} className="text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          title="Milestone Completed"
          desc="Sprint 4 for 'Aether App' has been approved by Lumina Systems."
          time="2h ago"
        />
        <ActivityRow
          icon={<Wallet size={16} className="text-violet-400" />}
          iconBg="bg-violet-500/15"
          title="Invoice Paid"
          desc="Payment of $4,500.00 received from NexaCorp Industries."
          time="5h ago"
          last
        />
      </div>
    </>
  );
}
