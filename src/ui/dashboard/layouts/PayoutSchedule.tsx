import { BarChart2 } from "lucide-react";
import { PayoutRow } from "../components/PayoutRow";
export function PayoutSchedule() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart2 size={18} /> Payout Schedule
        </h2>
        <button className="text-sm text-gray-100/50 hover:text-gray-100">
          View All
        </button>
      </div>
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 px-5 mb-10">
        <PayoutRow
          month="MAY"
          day="12"
          label="Weekly Retainer"
          amount="$1,250"
        />
        <PayoutRow
          month="MAY"
          day="15"
          label="Project Milestone"
          amount="$5,800"
          last
        />
      </div>
    </>
  );
}
