import { useNavigate } from "@tanstack/react-router";
import { getProjects } from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";

interface ProjectRow {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progress: string;
  createdAt: string;
  updatedAt: string;
  milestones: {
    id: string;
    title: string;
    status: string;
    startDate: string;
    dueDate: string;
    tasks: { id: string; title: string; status: string }[];
  }[];
}

function getPriorityStyle(_status: string) {
  // Map project status to a color badge
  switch (_status) {
    case "ON_PROGRESS":
      return "bg-yellow-500 text-black";
    case "DONE":
      return "bg-emerald-500 text-white";
    default:
      return "bg-neutral-700 text-gray-100";
  }
}

function getPriorityLabel(status: string) {
  switch (status) {
    case "ON_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Completed";
    default:
      return "Pending";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProjectsSection() {
  const navigate = useNavigate();
  const getProjectsFn = useServerFn(getProjects);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectsFn()
      .then((data) => setProjects(data as ProjectRow[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getProjectsFn]);

  function handleRowClick(name: string) {
    const slug = slugify(name);
    navigate({ to: "/project/$projectName", params: { projectName: slug } });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-gray-100/50">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-gray-100/50">No projects found.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
      </div>

      {/* Filter pill */}
      <div className="mb-6">
        <span className="inline-flex items-center bg-neutral-800 text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full">
          All Projects
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                Name
              </th>
              <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                Priority
              </th>
              <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                Target Date
              </th>
              <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                Tasks
              </th>
              <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const totalTasks = project.milestones.reduce(
                (sum, m) => sum + m.tasks.length,
                0,
              );
              const lastMilestone =
                project.milestones[project.milestones.length - 1];
              const targetDate = lastMilestone
                ? formatDate(lastMilestone.dueDate)
                : formatDate(project.createdAt);

              return (
                <tr
                  key={project.id}
                  onClick={() => handleRowClick(project.title)}
                  className="border-b border-neutral-800/40 text-sm text-gray-100/80 cursor-pointer hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="py-4 px-4">{project.title}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getPriorityStyle(project.status)}`}
                    >
                      {getPriorityLabel(project.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{targetDate}</td>
                  <td className="py-4 px-4">{totalTasks}</td>
                  <td className="py-4 px-4">{project.progress}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
