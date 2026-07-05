type Milestone = {
  tasks: { status: string }[];
};

export function ProjectProgress({ milestones }: { milestones: Milestone[] }) {
  const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
  const started = milestones
    .flatMap((m) => m.tasks)
    .filter((t) => t.status === "IN_PROGRESS").length;
  const completed = milestones
    .flatMap((m) => m.tasks)
    .filter((t) => t.status === "DONE").length;

  return (
    <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-100 mb-4">Progress</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-100/50">Total Task</span>
          <span className="text-sm text-gray-100 font-medium">
            {totalTasks}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-sm text-gray-100/50">Started</span>
          </div>
          <span className="text-sm text-gray-100 font-medium">{started}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-100/50">Completed</span>
          </div>
          <span className="text-sm text-gray-100 font-medium">{completed}</span>
        </div>
      </div>
    </div>
  );
}
