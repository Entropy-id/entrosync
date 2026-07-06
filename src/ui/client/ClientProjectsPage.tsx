import { CheckCircle2, Circle, Clock } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string;
};

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  tasks?: Task[];
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  milestones?: Milestone[];
};

function TaskStatusIcon({ status }: { status: string }) {
  if (status === "DONE") {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <CheckCircle2 size={12} className="text-white" />
      </div>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
        <Clock size={12} className="text-white" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
      <Circle size={10} className="text-gray-600" />
    </div>
  );
}

function MilestoneStatusBadge({ status }: { status: string }) {
  if (status === "DONE") {
    return (
      <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase">
        In Progress
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
      Not Started
    </span>
  );
}

export function ClientProjectsPage({ project }: { project: Project }) {
  const totalTasks =
    project.milestones?.reduce((sum, m) => sum + (m.tasks?.length ?? 0), 0) ??
    0;
  const completedTasks =
    project.milestones
      ?.flatMap((m) => m.tasks ?? [])
      ?.filter((t) => t.status === "DONE")?.length ?? 0;
  const inProgressTasks =
    project.milestones
      ?.flatMap((m) => m.tasks ?? [])
      ?.filter((t) => t.status === "IN_PROGRESS")?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Project Description */}
      {project.description && (
        <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">
            About This Project
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 text-center">
          <p className="text-2xl font-semibold text-white">
            {project.milestones?.length ?? 0}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
            Milestones
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 text-center">
          <p className="text-2xl font-semibold text-white">{totalTasks}</p>
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
            Total Tasks
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 text-center">
          <p className="text-2xl font-semibold text-emerald-400">
            {completedTasks}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
            Completed
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 text-center">
          <p className="text-2xl font-semibold text-sky-400">
            {inProgressTasks}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
            In Progress
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-6">
        {project.milestones?.map((milestone) => {
          const completedCount =
            milestone.tasks?.filter((t) => t.status === "DONE")?.length ?? 0;
          const totalCount = milestone.tasks?.length ?? 0;
          const milestonePercent =
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0;

          return (
            <div
              key={milestone.id}
              className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <MilestoneStatusBadge status={milestone.status} />
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-800 rounded-full h-2 mb-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>
                  {completedCount} of {totalCount} tasks completed
                </span>
                <span>{milestonePercent}%</span>
              </div>

              {/* Task list */}
              {(milestone.tasks?.length ?? 0) > 0 && (
                <div className="space-y-2 border-t border-neutral-800 pt-4">
                  {milestone.tasks?.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 py-2">
                      <TaskStatusIcon status={task.status} />
                      <span
                        className={`text-sm ${task.status === "DONE" ? "text-gray-400 line-through" : "text-gray-200"}`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
