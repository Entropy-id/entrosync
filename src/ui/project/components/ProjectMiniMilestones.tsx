import type { MilestoneDraft } from "../hooks/useMilestones";

export function ProjectMiniMilestones({
  milestones,
}: {
  milestones: MilestoneDraft[];
}) {
  return (
    <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-100 mb-4">Milestones</h3>
      <div className="space-y-3">
        {milestones.slice(0, 3).map((m, i) => (
          <div
            key={`${m.title}-${i}`}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-gray-100">{m.title}</span>
            <span className="text-xs text-gray-100/40">{m.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
