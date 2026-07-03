import { useNavigate } from "@tanstack/react-router";
import {
  getAllProjects,
  slugify,
  type Project,
} from "#/modules/project/project.mock";

function getPriorityStyle(priority: Project["priority"]) {
  switch (priority) {
    case "High":
      return "bg-red-500 text-white";
    case "Medium":
      return "bg-yellow-500 text-black";
    case "Low":
      return "bg-emerald-500 text-white";
    default:
      return "bg-neutral-700 text-gray-100";
  }
}

export function ProjectsSection() {
  const navigate = useNavigate();
  const projects = getAllProjects();

  function handleRowClick(name: string) {
    const slug = slugify(name);
    navigate({ to: "/project/$projectName", params: { projectName: slug } });
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
            {projects.map((project) => (
              <tr
                key={project.id}
                onClick={() => handleRowClick(project.name)}
                className="border-b border-neutral-800/40 text-sm text-gray-100/80 cursor-pointer hover:bg-neutral-800/40 transition-colors"
              >
                <td className="py-4 px-4">{project.name}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getPriorityStyle(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </td>
                <td className="py-4 px-4">{project.targetDate}</td>
                <td className="py-4 px-4">{project.tasks}</td>
                <td className="py-4 px-4">{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
