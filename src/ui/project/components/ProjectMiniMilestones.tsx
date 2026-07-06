import { Link } from "@tanstack/react-router";
import { slugify } from "#/modules/project/project.mock";
import type { MilestoneDraft } from "../hooks/useMilestones";

export function ProjectMiniMilestones({
  projectTitle,
  milestones,
}: {
  projectTitle: string;
  milestones?: MilestoneDraft[];
}) {
  return (
    <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
      <div className="text-sm font-semibold text-gray-100 mb-4">Milestones</div>
      <div className="space-y-3">
        {milestones?.slice(0, 3)?.map((m, _) => (
          <Link
            key={`${m.title}-${m.id}`}
            to="/project/$projectName/milestone/$milestoneTitle"
            params={{
              projectName: slugify(projectTitle),
              milestoneTitle: slugify(m.title),
            }}
          >
            <div className="flex cursor-pointer hover:bg-neutral-800/30 items-center justify-between p-2 rounded-xl">
              <span className="text-sm text-gray-100">{m.title}</span>
              <span className="text-xs text-gray-100/40">{m.date}</span>
              <span className="text-xs text-gray-100/40">{m.completion}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
