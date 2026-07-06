import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import type { User } from "#/ui/dashboard/layouts/Topbar";
import { EditableDescription } from "./components/EditableDescription";
import { EditableName } from "./components/EditableName";
import { InviteClientModal } from "./components/InviteClientModal";
import { ProjectBreadcrumb } from "./components/ProjectBreadcrumb";
import { ProjectMilestones } from "./components/ProjectMilestones";
import { ProjectMiniMilestones } from "./components/ProjectMiniMilestones";
import { ProjectProgress } from "./components/ProjectProgress";
import { ProjectProperties } from "./components/ProjectProperties";
import { ProjectResources } from "./components/ProjectResources";
import { SentInvitesList } from "./components/SentInvitesList";
import { useMilestones } from "./hooks/useMilestones";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  milestones: {
    id: string;
    title: string;
    projectId: string;
    description: string | null;
    dueDate: string | null;
    tasks: { status: string }[];
  }[];
  resources: { id: string; title: string }[];
  documents: {
    id: string;
    projectId: string;
    title: string;
    content: string | null;
    version: number;
    createdAt: string | null;
    updatedAt: string | null;
  }[];
}

export function ProjectDetailPage({
  project,
  user,
}: {
  project: Project;
  user?: User;
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const {
    milestones,
    editingMilestoneId,
    draftMilestone,
    setDraftMilestone,
    handleCreate,
    handleEdit,
    handleSave,
    handleDelete,
    handleCancel,
  } = useMilestones(project.milestones);

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
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} user={user} />

        <ProjectBreadcrumb name={project.title} />

        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <EditableName
                projectId={project.id}
                initialName={project.title}
              />

              <ProjectResources
                projectTitle={project.title}
                resources={project.resources}
                documents={project.documents}
              />

              <EditableDescription
                projectId={project.id}
                initialDescription={project.description}
              />

              <ProjectMilestones
                milestones={milestones}
                editingMilestoneId={editingMilestoneId}
                draftMilestone={draftMilestone}
                setDraftMilestone={setDraftMilestone}
                handleCreate={handleCreate}
                handleEdit={handleEdit}
                handleSave={handleSave}
                handleDelete={handleDelete}
                handleCancel={handleCancel}
                projectTitle={project.title}
                projectId={project.id}
              />
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              <ProjectProperties
                projectId={project.id}
                initialStatus={project.status}
                initialStartDate={project.startDate}
                initialDueDate={project.dueDate}
              />

              <ProjectMiniMilestones
                projectTitle={project.title}
                milestones={milestones}
              />

              <ProjectProgress milestones={project.milestones} />

              <div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-100">
                  Client Access
                </h3>
                <p className="text-xs text-gray-400">
                  Generate a secure link so your client can view project
                  progress without logging in.
                </p>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(true)}
                  className="w-full bg-white text-black text-sm font-bold rounded-full py-2.5 hover:bg-zinc-200 transition-colors"
                >
                  Invite Client
                </button>
                <SentInvitesList projectId={project.id} />
              </div>
            </div>

            {inviteModalOpen && (
              <InviteClientModal
                projectId={project.id}
                projectTitle={project.title}
                onClose={() => setInviteModalOpen(false)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
