import { getSessionServerFn } from "#/modules/auth/auth.api";
import { getProjectBySlug } from "#/modules/project/project.mock";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/project/$projectName/")({
  component: ProjectDetailPage,
  beforeLoad: async () => {
    const session = await getSessionServerFn();

    if (!session) {
      throw redirect({
        to: "/login",
      });
    }

    return session;
  },
  loader: ({ params }) => {
    const project = getProjectBySlug(params.projectName);
    if (!project) {
      throw notFound();
    }
    return { project };
  },
});

function ProjectDetailPage() {
  const navigate = useNavigate();
  const { project } = Route.useLoaderData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleChangeSection(
    _section: "Dashboard" | "Projects" | "Invoices",
  ) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
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

        <div className="max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="mb-6">
            <button
              onClick={() =>
                navigate({
                  to: "/dashboard/admin",
                  search: { tab: "Projects" },
                })
              }
              className="text-sm text-gray-100/50 hover:text-gray-100 mb-4"
            >
              ← Back to Projects
            </button>
            <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
            <p className="text-gray-100/50 text-sm">{project.client}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-4">
              <p className="text-xs text-gray-100/50 mb-1">Priority</p>
              <span
                className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${
                  project.priority === "High"
                    ? "bg-red-500 text-white"
                    : project.priority === "Medium"
                      ? "bg-yellow-500 text-black"
                      : "bg-emerald-500 text-white"
                }`}
              >
                {project.priority}
              </span>
            </div>
            <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-4">
              <p className="text-xs text-gray-100/50 mb-1">Target Date</p>
              <p className="text-sm font-medium">{project.targetDate}</p>
            </div>
            <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-4">
              <p className="text-xs text-gray-100/50 mb-1">Tasks</p>
              <p className="text-sm font-medium">{project.tasks}</p>
            </div>
            <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-4">
              <p className="text-xs text-gray-100/50 mb-1">Completion</p>
              <p className="text-sm font-medium">{project.status}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
