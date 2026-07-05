import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSessionServerFn } from "#/modules/auth/auth.api";
import {
  deleteTask,
  getProjectByTitle,
  updateTask,
} from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute(
  "/project/$projectName/milestone/$milestoneTitle/task/$taskId/",
)({
  component: TaskDetailPage,
  beforeLoad: async () => {
    const session = await getSessionServerFn();
    if (!session) {
      throw redirect({ to: "/login" });
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
});

function apiStatusToDisplay(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Completed";
    default:
      return "Not Started";
  }
}

function displayStatusToApi(status: string): string {
  switch (status) {
    case "Not Started":
      return "NOT_STARTED";
    case "In Progress":
      return "IN_PROGRESS";
    case "Completed":
      return "DONE";
    default:
      return "NOT_STARTED";
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "In Progress":
      return "bg-sky-500 text-white";
    case "Completed":
      return "bg-emerald-500 text-white";
    case "Review":
      return "bg-yellow-500 text-black";
    default:
      return "bg-neutral-700 text-gray-100";
  }
}

function getPriorityStyle(priority: string) {
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
  const { project, milestone, task } = Route.useLoaderData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deleting, setDeleting] = useState(false);

  const updateTaskFn = useServerFn(updateTask);
  const deleteTaskFn = useServerFn(deleteTask);

  function showSuccess(text: string) {
    setFeedback({ type: "success", text });
    setTimeout(() => setFeedback(null), 4000);
  }

  function showError(text: string) {
    setFeedback({ type: "error", text });
    setTimeout(() => setFeedback(null), 6000);
  }

  // Editable title & description
  const [name, setName] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveName = useCallback(async () => {
    setEditingName(false);
    if (name === task.title) return;
    try {
      await updateTaskFn({ data: { id: task.id, title: name } });
      showSuccess("Title updated successfully.");
    } catch (error) {
      console.error("Failed to update title", error);
      showError("Failed to update title. Please try again.");
    }
  }, [name, task.id, task.title, updateTaskFn]);

  const handleSaveDescription = useCallback(async () => {
    setEditingDesc(false);
    if (description === (task.description || "")) return;
    try {
      await updateTaskFn({ data: { id: task.id, description } });
      showSuccess("Description updated successfully.");
    } catch (error) {
      console.error("Failed to update description", error);
      showError("Failed to update description. Please try again.");
    }
  }, [description, task.id, task.description, updateTaskFn]);

  // Properties editable state
  const [status, setStatus] = useState(apiStatusToDisplay(task.status));
  const [priority, setPriority] = useState("Medium"); // local only – no Task.priority field
  const [startDate, setStartDate] = useState(formatDisplayDate(task.startDate));
  const [dueDate, setDueDate] = useState(formatDisplayDate(task.dueDate));

  const [editingProperty, setEditingProperty] = useState<
    "status" | "priority" | "startDate" | "dueDate" | null
  >(null);

  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  async function handleSaveProperty() {
    setEditingProperty(null);
    try {
      const data: Record<string, unknown> = { id: task.id };
      const apiStatus = displayStatusToApi(status);
      if (apiStatus !== task.status) data.status = apiStatus;
      if (startDate !== formatDisplayDate(task.startDate)) {
        data.startDate = startDate
          ? new Date(parseDisplayDate(startDate))
          : undefined;
      }
      if (dueDate !== formatDisplayDate(task.dueDate)) {
        data.dueDate = dueDate
          ? new Date(parseDisplayDate(dueDate))
          : undefined;
      }
      if (Object.keys(data).length > 1) {
        await updateTaskFn({ data });
        showSuccess("Properties updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update properties", error);
      showError("Failed to update properties. Please try again.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTaskFn({ data: { id: task.id } });
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

  // Sub-Tasks (local only – no sub-task table in schema)
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [showCreateSubTask, setShowCreateSubTask] = useState(false);
  const [draftSubTask, setDraftSubTask] = useState("");

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  function handleSaveSubTask() {
    if (!draftSubTask.trim()) return;
    setSubTasks((prev) => [...prev, draftSubTask.trim()]);
    setDraftSubTask("");
    setShowCreateSubTask(false);
    // TODO: call API to persist change (sub-tasks not supported yet)
  }

  function handleCancelSubTask() {
    setDraftSubTask("");
    setShowCreateSubTask(false);
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

              {/* Sub-Tasks */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base font-semibold text-gray-100">
                    Sub-Tasks
                  </span>
                  <span className="text-sm text-gray-100/50">
                    {subTasks.length}/{subTasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateSubTask(true)}
                    className="ml-1 p-1 rounded-full hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Create sub-task form */}
                {showCreateSubTask && (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="New sub-task..."
                      value={draftSubTask}
                      onChange={(e) => setDraftSubTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveSubTask();
                      }}
                      className="flex-1 bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-100/30 outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSubTask}
                      className="bg-white text-black text-sm font-medium px-3 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSubTask}
                      className="text-sm text-gray-100/50 hover:text-gray-100 px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Sub-task list */}
                <div className="space-y-3">
                  {subTasks.map((sub, _) => (
                    <p key={sub.charAt(1)} className="text-sm text-gray-100/80">
                      {sub}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar - Properties */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-100 mb-4">
                  Properties
                </h3>
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between relative">
                    <span className="text-sm text-gray-100/50">Status</span>
                    <div className="relative">
                      {editingProperty === "status" ? (
                        <div className="absolute right-0 top-full mt-1 z-10 bg-zinc-900 border border-neutral-700 rounded-xl p-1.5 shadow-xl space-y-1 min-w-[100px]">
                          {(
                            ["Not Started", "In Progress", "Completed"] as const
                          ).map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => {
                                setStatus(s);
                                handleSaveProperty();
                              }}
                              className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                status === s
                                  ? `${getStatusStyle(s)} opacity-90`
                                  : "text-gray-100 hover:bg-neutral-800"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setEditingProperty("status")}
                        className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(status)}`}
                      >
                        {status}
                      </button>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between relative">
                    <span className="text-sm text-gray-100/50">Priority</span>
                    <div className="relative">
                      {editingProperty === "priority" ? (
                        <div className="absolute right-0 top-full mt-1 z-10 bg-zinc-900 border border-neutral-700 rounded-xl p-1.5 shadow-xl space-y-1 min-w-[100px]">
                          {(["High", "Medium", "Low"] as const).map((p) => (
                            <button
                              type="button"
                              key={p}
                              onClick={() => {
                                setPriority(p);
                                handleSaveProperty();
                              }}
                              className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                priority === p
                                  ? `${getPriorityStyle(p)} opacity-90`
                                  : "text-gray-100 hover:bg-neutral-800"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setEditingProperty("priority")}
                        className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getPriorityStyle(priority)}`}
                      >
                        {priority}
                      </button>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100/50">Start Date</span>
                    {editingProperty === "startDate" ? (
                      <input
                        ref={startDateRef}
                        type="date"
                        value={parseDisplayDate(startDate)}
                        onChange={(e) => {
                          const iso = e.target.value;
                          if (iso) setStartDate(formatDisplayDate(iso));
                        }}
                        onBlur={handleSaveProperty}
                        className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 [color-scheme:dark]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProperty("startDate");
                          setTimeout(
                            () => startDateRef.current?.showPicker(),
                            0,
                          );
                        }}
                        className="text-sm text-gray-100 hover:underline"
                      >
                        {startDate || "—"}
                      </button>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100/50">Due Date</span>
                    {editingProperty === "dueDate" ? (
                      <input
                        ref={dueDateRef}
                        type="date"
                        value={parseDisplayDate(dueDate)}
                        onChange={(e) => {
                          const iso = e.target.value;
                          if (iso) setDueDate(formatDisplayDate(iso));
                        }}
                        onBlur={handleSaveProperty}
                        className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 [color-scheme:dark]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProperty("dueDate");
                          setTimeout(() => dueDateRef.current?.showPicker(), 0);
                        }}
                        className="text-sm text-gray-100 hover:underline"
                      >
                        {dueDate || "—"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
