import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { ProjectBreadcrumb } from "./components/ProjectBreadcrumb";
import { EditableName } from "./components/EditableName";
import { ProjectResources } from "./components/ProjectResources";
import { EditableDescription } from "./components/EditableDescription";
import { ProjectMilestones } from "./components/ProjectMilestones";
import { ProjectMiniMilestones } from "./components/ProjectMiniMilestones";
import { ProjectProperties } from "./components/ProjectProperties";
import { ProjectProgress } from "./components/ProjectProgress";
import { useMilestones } from "./hooks/useMilestones";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  milestones: {
    title: string;
    dueDate: string | null;
    tasks: { status: string }[];
  }[];
  resources: { id: string; title: string }[];
}

export function ProjectDetailPage({ project }: { project: Project }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        <ProjectBreadcrumb name={project.title} />

        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <EditableName
                projectId={project.id}
                initialName={project.title}
              />

              <ProjectResources resources={project.resources} />

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

              <ProjectMiniMilestones milestones={milestones} />

              <ProjectProgress milestones={project.milestones} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
