import { getSessionServerFn } from "#/modules/auth/auth.api";
import { getProjectBySlug, slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/project/$projectName/milestone/$milestoneTitle/",
)({
  component: MilestoneDetailPage,
  beforeLoad: async () => {
    const session = await getSessionServerFn();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return session;
  },
  loader: ({ params }) => {
    const project = getProjectBySlug(params.projectName);
    if (!project) throw notFound();
    const milestone = project.milestones.find(
      (m) => slugify(m.title) === params.milestoneTitle,
    );
    if (!milestone) throw notFound();
    return { project, milestone };
  },
});

function MilestoneDetailPage() {
  const navigate = useNavigate();
  const { project, milestone } = Route.useLoaderData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local task state
  const [tasks, setTasks] = useState(
    milestone.taskList.map((t, i) => ({ ...t, id: t.id || `ID-${i + 1}` })),
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draftTask, setDraftTask] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  function handleSaveTask() {
    if (!draftTask.name.trim()) return;
    const nextId = tasks.length + 1;
    setTasks((prev) => [
      ...prev,
      {
        id: `ID-${nextId}`,
        name: draftTask.name,
        description: draftTask.description,
        dueDate: draftTask.dueDate,
      },
    ]);
    setDraftTask({ name: "", description: "", dueDate: "" });
    setShowCreateForm(false);
    // TODO: call API to persist change
  }

  function handleCancelCreate() {
    setDraftTask({ name: "", description: "", dueDate: "" });
    setShowCreateForm(false);
  }

  function parseDisplayDate(display: string): string {
    const match = display.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!match) return "";
    const [, day, monthStr, year] = match;
    const months: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    const month = months[monthStr] || "01";
    return `${year}-${month}-${day.padStart(2, "0")}`;
  }

  function formatDisplayDate(iso: string): string {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
  }

  return (
    <div className="min-h-screen w-full flex font-inter">
      <Sidebar
        currentSection="Projects"
        onChangeSection={handleChangeSection}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
          <nav className="text-sm text-gray-100/50 mb-6">
            <button
              onClick={() =>
                navigate({
                  to: "/dashboard/admin",
                  search: { tab: "Projects" },
                })
              }
              className="hover:text-gray-100 transition-colors"
            >
              Projects
            </button>
            <span className="mx-1">&gt;</span>
            <button
              onClick={() =>
                navigate({
                  to: "/project/$projectName",
                  params: { projectName: slugify(project.name) },
                })
              }
              className="hover:text-gray-100 transition-colors"
            >
              {project.name}
            </button>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-100 font-medium">{milestone.title}</span>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          {/* Tasks header */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center bg-neutral-800 text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full">
              Tasks
            </span>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-100/50 hover:text-gray-100 transition-colors"
            >
              <Plus size={14} />
              Create Task
            </button>
          </div>

          {/* Create task form */}
          {showCreateForm && (
            <div className="bg-zinc-900/50 border border-neutral-800 rounded-xl p-4 mb-6 space-y-3">
              <input
                type="text"
                placeholder="Task name"
                value={draftTask.name}
                onChange={(e) =>
                  setDraftTask((d) => ({ ...d, name: e.target.value }))
                }
                className="w-full bg-transparent text-sm font-semibold text-gray-100 placeholder:text-gray-100/30 outline-none border-b border-neutral-700 focus:border-sky-500 pb-1"
              />
              <textarea
                placeholder="Task description..."
                value={draftTask.description}
                onChange={(e) =>
                  setDraftTask((d) => ({ ...d, description: e.target.value }))
                }
                rows={2}
                className="w-full bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-100/30 outline-none focus:border-sky-500 resize-y"
              />
              <input
                type="date"
                value={
                  draftTask.dueDate ? parseDisplayDate(draftTask.dueDate) : ""
                }
                onChange={(e) => {
                  const iso = e.target.value;
                  if (iso)
                    setDraftTask((d) => ({
                      ...d,
                      dueDate: formatDisplayDate(iso),
                    }));
                }}
                className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-40 scheme-dark"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveTask}
                  className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tasks table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                    ID
                  </th>
                  <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                    Name
                  </th>
                  <th className="text-sm text-gray-100 font-semibold py-4 px-4">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-neutral-800/40 text-sm text-gray-100/80 cursor-pointer hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-4 px-4">{task.id}</td>
                    <td className="py-4 px-4">{task.name}</td>
                    <td className="py-4 px-4">{task.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
