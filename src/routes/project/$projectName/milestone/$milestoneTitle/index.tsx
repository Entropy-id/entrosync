import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import {
  createTask,
  deleteTask,
  getProjectByTitle,
} from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";

export const Route = createFileRoute(
  "/project/$projectName/milestone/$milestoneTitle/",
)({
  component: MilestoneDetailPage,
  beforeLoad: async () => {
    const result = await getSessionWithOnboardingServerFn();
    if (!result) {
      throw redirect({ to: "/login" });
    }
    const { session, onboardingCompleted } = result;
    if (!onboardingCompleted) {
      throw redirect({ to: "/onboarding" });
    }
    return session;
  },
  loader: async ({ params }) => {
    const project = await getProjectByTitle({
      data: { title: params.projectName },
    });
    if (!project) throw notFound();
    const milestone = project.milestones.find(
      (m) => slugify(m.title) === params.milestoneTitle,
    );
    if (!milestone) throw notFound();
    return { project, milestone };
  },
  staleTime: 30_000,
});

function formatDisplayDate(iso: string | null): string {
  if (!iso) return "";
  const datePart = iso.includes("T") ? iso.slice(0, 10) : iso;
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "";
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

type Feedback =
  { type: "success"; text: string } | { type: "error"; text: string } | null;

function SuccessMessage({ message }: { message: string }) {
  return (
    <aside
      role="alert"
      className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
    >
      {message}
    </aside>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <aside
      role="alert"
      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
    >
      {message}
    </aside>
  );
}

function MilestoneDetailPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { project, milestone } = Route.useLoaderData();
  const session = Route.useRouteContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function showSuccess(text: string) {
    setFeedback({ type: "success", text });
    setTimeout(() => setFeedback(null), 4000);
  }

  function showError(text: string) {
    setFeedback({ type: "error", text });
    setTimeout(() => setFeedback(null), 6000);
  }

  // Local task state mapped from real data
  const [tasks, setTasks] = useState(
    milestone.tasks.map((t) => ({
      ...t,
      name: t.title,
      dueDate: formatDisplayDate(t.dueDate),
    })),
  );

  useEffect(() => {
    setTasks(
      milestone.tasks.map((t) => ({
        ...t,
        name: t.title,
        dueDate: formatDisplayDate(t.dueDate),
      })),
    );
  }, [milestone.tasks]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [draftTask, setDraftTask] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const createTaskFn = useServerFn(createTask);
  const deleteTaskFn = useServerFn(deleteTask);

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  async function handleSaveTask() {
    if (!draftTask.name.trim()) return;
    setSaving(true);
    try {
      const result = await createTaskFn({
        data: {
          milestoneId: milestone.id,
          title: draftTask.name,
          description: draftTask.description,
          dueDate: draftTask.dueDate ? new Date(draftTask.dueDate) : undefined,
        },
      });
      setTasks((prev) => [
        ...prev,
        {
          ...result,
          name: result.title,
          dueDate: formatDisplayDate(result.dueDate),
        },
      ]);
      setDraftTask({ name: "", description: "", dueDate: "" });
      setShowCreateForm(false);
      showSuccess("Task created successfully.");
      await router.invalidate();
    } catch (error) {
      console.error("Failed to create task", error);
      showError("Failed to create task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask(index: number) {
    const task = tasks[index];
    if (!task?.id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setDeletingIndex(index);
    try {
      await deleteTaskFn({ data: { id: task.id } });
      setTasks((prev) => prev.filter((_, i) => i !== index));
      showSuccess("Task deleted successfully.");
      await router.invalidate();
    } catch (error) {
      console.error("Failed to delete task", error);
      showError("Failed to delete task. Please try again.");
    } finally {
      setDeletingIndex(null);
      setOpenMenuIndex(null);
    }
  }

  function handleCancelCreate() {
    setDraftTask({ name: "", description: "", dueDate: "" });
    setShowCreateForm(false);
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
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          user={session?.user}
        />

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
          <nav className="text-sm text-gray-100/50 mb-6">
            <button
              type="button"
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
              type="button"
              onClick={() =>
                navigate({
                  to: "/project/$projectName",
                  params: { projectName: slugify(project.title) },
                })
              }
              className="hover:text-gray-100 transition-colors"
            >
              {project.title}
            </button>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-100 font-medium">{milestone.title}</span>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          {/* Feedback */}
          {feedback?.type === "success" && (
            <SuccessMessage message={feedback.text} />
          )}
          {feedback?.type === "error" && (
            <ErrorMessage message={feedback.text} />
          )}

          {/* Tasks header */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center bg-neutral-800 text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full">
              Tasks
            </span>
            <button
              type="button"
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
                  setDraftTask((d) => ({
                    ...d,
                    description: e.target.value,
                  }))
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
                className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-40 [color-scheme:dark]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveTask}
                  disabled={saving}
                  className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
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
                  <th className="text-sm text-gray-100 font-semibold py-4 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr
                    key={task.id}
                    onClick={() =>
                      navigate({
                        to: "/project/$projectName/milestone/$milestoneTitle/task/$taskId",
                        params: {
                          projectName: slugify(project.title),
                          milestoneTitle: slugify(milestone.title),
                          taskId: task.id,
                        },
                      })
                    }
                    className="border-b border-neutral-800/40 text-sm text-gray-100/80 cursor-pointer hover:bg-neutral-800/40 transition-colors group relative"
                  >
                    <td className="py-4 px-4">{task.id.slice(0, 8)}</td>
                    <td className="py-4 px-4">{task.name}</td>
                    <td className="py-4 px-4">{task.dueDate}</td>
                    <td className="py-4 px-4">
                      <div
                        ref={openMenuIndex === i ? menuRef : null}
                        className="relative inline-block"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(openMenuIndex === i ? null : i);
                          }}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/70 hover:text-gray-100"
                        >
                          <EllipsisVertical size={14} />
                        </button>
                        {openMenuIndex === i && (
                          <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIndex(null);
                                navigate({
                                  to: "/project/$projectName/milestone/$milestoneTitle/task/$taskId",
                                  params: {
                                    projectName: slugify(project.title),
                                    milestoneTitle: slugify(milestone.title),
                                    taskId: task.id,
                                  },
                                });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-neutral-800 transition-colors"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(i);
                              }}
                              disabled={deletingIndex === i}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                              {deletingIndex === i ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
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
