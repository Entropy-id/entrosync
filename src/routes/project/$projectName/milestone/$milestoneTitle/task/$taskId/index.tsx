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
import { useState, useRef } from "react";

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
  loader: ({ params }) => {
    const project = getProjectBySlug(params.projectName);
    if (!project) throw notFound();
    const milestone = project.milestones.find(
      (m) => slugify(m.title) === params.milestoneTitle,
    );
    if (!milestone) throw notFound();
    const task = milestone.taskList.find((t) => t.id === params.taskId);
    if (!task) throw notFound();
    return { project, milestone, task };
  },
});

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

function TaskDetailPage() {
  const navigate = useNavigate();
  const { project, milestone, task } = Route.useLoaderData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local editable state
  const [subTasks, setSubTasks] = useState(task.subTasks);
  const [showCreateSubTask, setShowCreateSubTask] = useState(false);
  const [draftSubTask, setDraftSubTask] = useState("");

  // Properties editable state
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [startDate, setStartDate] = useState(task.startDate);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const [editingProperty, setEditingProperty] = useState<
    "status" | "priority" | "startDate" | "dueDate" | null
  >(null);

  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  function handleSaveProperty() {
    setEditingProperty(null);
    // TODO: call API to persist change
  }

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  function handleSaveSubTask() {
    if (!draftSubTask.trim()) return;
    setSubTasks((prev) => [...prev, draftSubTask.trim()]);
    setDraftSubTask("");
    setShowCreateSubTask(false);
    // TODO: call API to persist change
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
            <button
              onClick={() =>
                navigate({
                  to: "/project/$projectName/milestone/$milestoneTitle",
                  params: {
                    projectName: slugify(project.name),
                    milestoneTitle: slugify(milestone.title),
                  },
                })
              }
              className="hover:text-gray-100 transition-colors"
            >
              {milestone.title}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-3xl font-bold mb-3">{task.name}</h1>

              {/* Description */}
              <p className="text-sm text-gray-100/70 leading-6 mb-8 max-w-2xl">
                {task.description}
              </p>

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
                      autoFocus
                      className="flex-1 bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-100/30 outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleSaveSubTask}
                      className="bg-white text-black text-sm font-medium px-3 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelSubTask}
                      className="text-sm text-gray-100/50 hover:text-gray-100 px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Sub-task list */}
                <div className="space-y-3">
                  {subTasks.map((sub, i) => (
                    <p key={i} className="text-sm text-gray-100/80">
                      {sub}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar - Properties */}
            <div className="w-full lg:w-72 shrink-0">
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
                        <div className="absolute right-0 top-full mt-1 z-10 bg-zinc-900 border border-neutral-700 rounded-xl p-1.5 shadow-xl space-y-1 min-w-25">
                          {(
                            [
                              "Not Started",
                              "In Progress",
                              "Completed",
                              "Review",
                            ] as const
                          ).map((s) => (
                            <button
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
                        <div className="absolute right-0 top-full mt-1 z-10 bg-zinc-900 border border-neutral-700 rounded-xl p-1.5 shadow-xl space-y-1 min-w-25">
                          {(["High", "Medium", "Low"] as const).map((p) => (
                            <button
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
                        autoFocus
                        className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 scheme-dark"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingProperty("startDate");
                          setTimeout(
                            () => startDateRef.current?.showPicker(),
                            0,
                          );
                        }}
                        className="text-sm text-gray-100 hover:underline"
                      >
                        {startDate}
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
                        autoFocus
                        className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 scheme-dark"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingProperty("dueDate");
                          setTimeout(() => dueDateRef.current?.showPicker(), 0);
                        }}
                        className="text-sm text-gray-100 hover:underline"
                      >
                        {dueDate}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
