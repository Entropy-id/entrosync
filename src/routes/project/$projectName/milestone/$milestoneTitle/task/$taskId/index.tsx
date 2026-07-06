import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import {
  deleteTask,
  getProjectByTitle,
  updateTask,
} from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { TaskProperties } from "#/ui/project/components/TaskProperties";

export const Route = createFileRoute(
  "/project/$projectName/milestone/$milestoneTitle/task/$taskId/",
)({
  component: TaskDetailPage,
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
    const task = milestone.tasks.find((t) => t.id === params.taskId);
    if (!task) throw notFound();
    return { project, milestone, task };
  },
  staleTime: 30_000,
});

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

function TaskDetailPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { project, milestone, task } = Route.useLoaderData();
  const session = Route.useRouteContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deleting, setDeleting] = useState(false);

  const updateTaskFn = useServerFn(updateTask);
  const deleteTaskFn = useServerFn(deleteTask);

  const showSuccess = useCallback((text: string) => {
    setFeedback({ type: "success", text });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const showError = useCallback((text: string) => {
    setFeedback({ type: "error", text });
    setTimeout(() => setFeedback(null), 6000);
  }, []);

  // Editable title & description
  const [name, setName] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setName(task.title);
    setDescription(task.description || "");
  }, [task]);

  const handleSaveName = useCallback(async () => {
    setEditingName(false);
    if (name === task.title) return;
    try {
      await updateTaskFn({ data: { id: task.id, title: name } });
      await router.invalidate();
      showSuccess("Title updated successfully.");
    } catch (error) {
      console.error("Failed to update title", error);
      showError("Failed to update title. Please try again.");
    }
  }, [name, task.id, task.title, updateTaskFn, showSuccess, showError, router]);

  const handleSaveDescription = useCallback(async () => {
    setEditingDesc(false);
    if (description === (task.description || "")) return;
    try {
      await updateTaskFn({ data: { id: task.id, description } });
      await router.invalidate();
      showSuccess("Description updated successfully.");
    } catch (error) {
      console.error("Failed to update description", error);
      showError("Failed to update description. Please try again.");
    }
  }, [
    description,
    task.id,
    task.description,
    updateTaskFn,
    showSuccess,
    showError,
    router,
  ]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTaskFn({ data: { id: task.id } });
      await router.invalidate();
      showSuccess("Task deleted successfully.");
      setTimeout(() => {
        navigate({
          to: "/project/$projectName/milestone/$milestoneTitle",
          params: {
            projectName: slugify(project.title),
            milestoneTitle: slugify(milestone.title),
          },
        });
      }, 800);
    } catch (error) {
      console.error("Failed to delete task", error);
      showError("Failed to delete task. Please try again.");
      setDeleting(false);
    }
  }

  function handleChangeSection(_section: Section) {
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
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/project/$projectName/milestone/$milestoneTitle",
                  params: {
                    projectName: slugify(project.title),
                    milestoneTitle: slugify(milestone.title),
                  },
                })
              }
              className="hover:text-gray-100 transition-colors"
            >
              {milestone.title}
            </button>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-100 font-medium">{name}</span>
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

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              {/* Editable title */}
              <div className="group flex items-center gap-3 mb-4">
                {editingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                    }}
                    className="bg-transparent text-3xl font-bold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 w-full pb-1"
                  />
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{name}</h1>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(true);
                        setTimeout(() => nameInputRef.current?.focus(), 0);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Editable description */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-100">
                    Description
                  </h2>
                  {!editingDesc && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDesc(true);
                        setTimeout(() => descTextareaRef.current?.focus(), 0);
                      }}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {editingDesc ? (
                  <div className="space-y-3">
                    <textarea
                      ref={descTextareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={10}
                      className="w-full bg-zinc-900/80 border border-neutral-700 rounded-xl p-4 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y font-mono leading-6"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveDescription}
                        className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDesc(false)}
                        className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-100/70 leading-7">
                    <ReactMarkdown>{description}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar - Properties */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              <TaskProperties
                taskId={task.id}
                initialStatus={task.status}
                initialStartDate={task.startDate}
                initialDueDate={task.dueDate}
              />

              {/* Delete Task */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
