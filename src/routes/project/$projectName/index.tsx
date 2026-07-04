import { getSessionServerFn } from "#/modules/auth/auth.api";
import {
  getProjectByTitle,
  updateProject,
} from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import { useServerFn } from "@tanstack/react-start";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { FileText, Pencil, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useCallback } from "react";

export const Route = createFileRoute("/project/$projectName/")({
  component: ProjectDetailPage,
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
    return { project };
  },
});

function ProjectDetailPage() {
  const navigate = useNavigate();
  const { project } = Route.useLoaderData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Editable state (local only until update API is wired)
  const [name, setName] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  const updateProjectFn = useServerFn(updateProject);

  const handleSaveName = useCallback(async () => {
    setEditingName(false);
    if (name === project.title) return;
    try {
      await updateProjectFn({
        data: {
          id: project.id,
          title: name,
        },
      });
    } catch (error) {
      console.error("Failed to update project name", error);
      setName(project.title);
    }
  }, [name, project.id, project.title, updateProjectFn]);

  const handleSaveDescription = useCallback(async () => {
    setEditingDesc(false);
    console.log(
      `Description: ${description}, project.description: ${project.description}`,
    );
    if (description === project.description) return;
    try {
      console.log("Try to update project");
      await updateProjectFn({
        data: {
          id: project.id,
          description: description,
        },
      });
    } catch (error) {
      console.error("Failed to update project description", error);
      setDescription(project.description ?? "");
    }
  }, [description, project.id, project.description, updateProjectFn]);

  // Properties editable state
  const apiStatusToDisplay = (s: string) => {
    if (s === "PENDING") return "Not Started";
    if (s === "ON_PROGRESS") return "In Progress";
    if (s === "DONE") return "Completed";
    return "Not Started";
  };
  const displayStatusToApi = (s: string) => {
    if (s === "Not Started") return "PENDING";
    if (s === "In Progress") return "ON_PROGRESS";
    if (s === "Completed") return "DONE";
    return "PENDING";
  };

  const [status, setStatus] = useState(apiStatusToDisplay(project.status));
  const [startDate, setStartDate] = useState(
    formatDisplayDate(project.startDate),
  );
  const [targetDate, setTargetDate] = useState(
    formatDisplayDate(project.dueDate),
  );

  const [editingProperty, setEditingProperty] = useState<
    "status" | "startDate" | "targetDate" | null
  >(null);

  const startDateRef = useRef<HTMLInputElement>(null);
  const targetDateRef = useRef<HTMLInputElement>(null);

  function handleSaveProperty(
    propertyToSave: "status" | "startDate" | "targetDate",
    updatedValue: string,
  ) {
    setEditingProperty(null);
    console.log(propertyToSave);
    console.log(updatedValue);

    const currentStatus = propertyToSave === "status" ? updatedValue : status;
    const currentStartDate =
      propertyToSave === "startDate" ? updatedValue : startDate;
    const currentTargetDate =
      propertyToSave === "targetDate" ? updatedValue : targetDate;

    if (propertyToSave === "status") {
      updateProjectFn({
        data: {
          id: project.id,
          status: displayStatusToApi(currentStatus),
        },
      });
    }
    if (propertyToSave === "startDate") {
      console.log(`Start Date: ${currentStartDate}`);
      updateProjectFn({
        data: {
          id: project.id,
          startDate: currentStartDate,
        },
      });
    }
    if (propertyToSave === "targetDate") {
      console.log(`Target Date: ${currentTargetDate}`);
      updateProjectFn({
        data: {
          id: project.id,
          targetDate: currentTargetDate,
        },
      });
    }
  }

  // Milestones editable state
  type MilestoneDraft = {
    title: string;
    description: string;
    date: string;
    tasks: number;
    completion: string;
  };

  function computeMilestoneCompletion(tasks: { status: string }[]): string {
    if (tasks.length === 0) return "0%";
    const done = tasks.filter((t) => t.status === "DONE").length;
    return `${Math.round((done / tasks.length) * 100)}%`;
  }

  const [milestones, setMilestones] = useState<MilestoneDraft[]>(
    project.milestones.map((m) => ({
      title: m.title,
      description: "", // real milestones have no description field
      date: formatDisplayDate(m.dueDate),
      tasks: m.tasks.length,
      completion: computeMilestoneCompletion(m.tasks),
    })),
  );
  const [editingMilestoneId, setEditingMilestoneId] = useState<
    number | "new" | null
  >(null);
  const [draftMilestone, setDraftMilestone] = useState<MilestoneDraft>({
    title: "",
    description: "",
    date: "",
    tasks: 0,
    completion: "0%",
  });

  function handleCreateMilestone() {
    setDraftMilestone({
      title: "",
      description: "",
      date: "",
      tasks: 0,
      completion: "0%",
    });
    setEditingMilestoneId("new");
  }

  function handleEditMilestone(index: number) {
    setDraftMilestone({ ...milestones[index] });
    setEditingMilestoneId(index);
  }

  function handleSaveMilestone() {
    if (!draftMilestone.title.trim()) return;
    if (editingMilestoneId === "new") {
      setMilestones((prev) => [...prev, draftMilestone]);
    } else if (editingMilestoneId !== null) {
      setMilestones((prev) =>
        prev.map((m, i) => (i === editingMilestoneId ? draftMilestone : m)),
      );
    }
    setEditingMilestoneId(null);
    // TODO: call API to persist change
  }

  function handleDeleteMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
    if (editingMilestoneId === index) setEditingMilestoneId(null);
    // TODO: call API to persist change
  }

  function handleCancelMilestone() {
    setEditingMilestoneId(null);
  }

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  function getStatusStyle(s: string) {
    if (s === "In Progress") return "bg-sky-500 text-white";
    if (s === "Completed") return "bg-emerald-500 text-white";
    return "bg-neutral-700 text-gray-100";
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
            <span className="text-gray-100 font-medium">{name}</span>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              {/* Editable project name */}
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
                    autoFocus
                    className="bg-transparent text-3xl font-bold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 w-full pb-1"
                  />
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{name}</h1>
                    <button
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

              {/* Resources */}
              <div className="flex items-center gap-3 mb-10">
                <span className="text-sm text-gray-100/50">Resources</span>
                {project.resources.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-2 text-sm text-gray-100 bg-neutral-800/60 px-3 py-1.5 rounded-lg"
                  >
                    <FileText size={14} />
                    {r.title}
                  </span>
                ))}
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Editable description with react-markdown */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-100">
                    Description
                  </h2>
                  {!editingDesc && (
                    <button
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
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      rows={10}
                      className="w-full bg-zinc-900/80 border border-neutral-700 rounded-xl p-4 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y font-mono leading-6"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Save
                      </button>
                      <button
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

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-100">
                    Milestones
                  </h2>
                  <button
                    onClick={handleCreateMilestone}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-100/50 hover:text-gray-100 transition-colors"
                  >
                    <Plus size={14} />
                    Create Milestone
                  </button>
                </div>

                {/* New milestone form */}
                {editingMilestoneId === "new" && (
                  <div className="bg-zinc-900/50 border border-neutral-800 rounded-xl p-4 mb-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Milestone name"
                      value={draftMilestone.title}
                      onChange={(e) =>
                        setDraftMilestone((d) => ({
                          ...d,
                          title: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-sm font-semibold text-gray-100 placeholder:text-gray-100/30 outline-none border-b border-neutral-700 focus:border-sky-500 pb-1"
                    />
                    <textarea
                      placeholder="Milestone description..."
                      value={draftMilestone.description}
                      onChange={(e) =>
                        setDraftMilestone((d) => ({
                          ...d,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-100/30 outline-none focus:border-sky-500 resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveMilestone}
                        className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelMilestone}
                        className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {milestones.map((m, i) => (
                    <div key={`${m.title}-${i}`} className="group">
                      {editingMilestoneId === i ? (
                        <div className="bg-zinc-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
                          <input
                            type="text"
                            value={draftMilestone.title}
                            onChange={(e) =>
                              setDraftMilestone((d) => ({
                                ...d,
                                title: e.target.value,
                              }))
                            }
                            className="w-full bg-transparent text-sm font-semibold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 pb-1"
                          />
                          <textarea
                            value={draftMilestone.description}
                            onChange={(e) =>
                              setDraftMilestone((d) => ({
                                ...d,
                                description: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveMilestone}
                              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelMilestone}
                              className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            navigate({
                              to: "/project/$projectName/milestone/$milestoneTitle",
                              params: {
                                projectName: slugify(project.title),
                                milestoneTitle: slugify(m.title),
                              },
                            })
                          }
                          className="relative cursor-pointer hover:bg-neutral-800/30 rounded-xl p-3 -mx-3 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-100">
                              {m.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-100/40">
                              <span>{m.date}</span>
                              <span>•</span>
                              <span>{m.tasks} Task</span>
                              <span>•</span>
                              <span>{m.completion}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-100/50 line-clamp-2">
                            {m.description}
                          </p>
                          {/* Hover actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMilestone(i);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMilestone(i);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-red-400"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              {/* Properties */}
              <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-100">
                    Properties
                  </h3>
                </div>
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
                              key={s}
                              onClick={() => {
                                setStatus(s);
                                handleSaveProperty("status", s);
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

                  {/* Start Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100/50">Start Date</span>
                    {editingProperty === "startDate" ? (
                      <input
                        ref={startDateRef}
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          const iso = e.target.value;
                          if (iso) {
                            setStartDate(formatDisplayDate(iso));
                            setEditingProperty("startDate");
                            handleSaveProperty("startDate", iso);
                          }
                        }}
                        onBlur={() => setEditingProperty("startDate")}
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
                        {startDate || "—"}
                      </button>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100/50">Due Date</span>
                    {editingProperty === "targetDate" ? (
                      <input
                        ref={targetDateRef}
                        type="date"
                        value={targetDate}
                        onChange={(e) => {
                          const iso = e.target.value;
                          if (iso) {
                            setTargetDate(formatDisplayDate(iso));
                            setEditingProperty("targetDate");
                            handleSaveProperty(
                              "targetDate",
                              formatDisplayDate(iso),
                            );
                          }
                        }}
                        onBlur={() => setEditingProperty("targetDate")}
                        autoFocus
                        className="bg-zinc-900/80 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-sky-500 w-32 scheme-dark"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingProperty("targetDate");
                          setTimeout(
                            () => targetDateRef.current?.showPicker(),
                            0,
                          );
                        }}
                        className="text-sm text-gray-100 hover:underline"
                      >
                        {targetDate || "—"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-100 mb-4">
                  Milestones
                </h3>
                <div className="space-y-3">
                  {milestones.slice(0, 3).map((m, i) => (
                    <div
                      key={`${m.title}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-100">{m.title}</span>
                      <span className="text-xs text-gray-100/40">{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-100 mb-4">
                  Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-100/50">Total Task</span>
                    <span className="text-sm text-gray-100 font-medium">
                      {project.milestones.reduce(
                        (sum, m) => sum + m.tasks.length,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-sm text-gray-100/50">Started</span>
                    </div>
                    <span className="text-sm text-gray-100 font-medium">
                      {
                        project.milestones
                          .flatMap((m) => m.tasks)
                          .filter((t) => t.status === "IN_PROGRESS").length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm text-gray-100/50">
                        Completed
                      </span>
                    </div>
                    <span className="text-sm text-gray-100 font-medium">
                      {
                        project.milestones
                          .flatMap((m) => m.tasks)
                          .filter((t) => t.status === "DONE").length
                      }
                    </span>
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
