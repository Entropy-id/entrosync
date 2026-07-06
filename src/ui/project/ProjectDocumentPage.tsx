import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, Eye, Pencil, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  deleteProjectDocument,
  updateProjectDocument,
} from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import type { User } from "#/ui/dashboard/layouts/Topbar";

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Project {
  id: string;
  title: string;
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

export function ProjectDocumentPage({
  project,
  document: initialDocument,
  user,
}: {
  project: Project;
  document: Document;
  user?: User;
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState(initialDocument.content || "");
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const updateDocumentFn = useServerFn(updateProjectDocument);
  const deleteDocumentFn = useServerFn(deleteProjectDocument);

  function handleChangeSection(_section: Section) {
    navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
  }

  function showSuccess(text: string) {
    setFeedback({ type: "success", text });
    setTimeout(() => setFeedback(null), 4000);
  }

  function showError(text: string) {
    setFeedback({ type: "error", text });
    setTimeout(() => setFeedback(null), 6000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateDocumentFn({
        data: { id: initialDocument.id, content },
      });
      showSuccess("Document saved successfully.");
    } catch (error) {
      console.error("Failed to save document", error);
      showError("Failed to save document. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    setDeleting(true);
    try {
      await deleteDocumentFn({ data: { id: initialDocument.id } });
      showSuccess("Document deleted successfully.");
      setTimeout(() => {
        navigate({
          to: "/project/$projectName",
          params: { projectName: slugify(project.title) },
        });
      }, 800);
    } catch (error) {
      console.error("Failed to delete document", error);
      showError("Failed to delete document. Please try again.");
      setDeleting(false);
    }
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

        <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-4">
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/project/$projectName",
                  params: { projectName: slugify(project.title) },
                })
              }
              className="inline-flex items-center gap-1 text-sm text-gray-100/50 hover:text-gray-100 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to {project.title}
            </button>
          </div>

          {/* Feedback */}
          {feedback?.type === "success" && (
            <SuccessMessage message={feedback.text} />
          )}
          {feedback?.type === "error" && (
            <ErrorMessage message={feedback.text} />
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-100">
              {initialDocument.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-gray-100 transition-colors"
              >
                {isPreview ? (
                  <>
                    <Pencil size={14} /> Edit
                  </>
                ) : (
                  <>
                    <Eye size={14} /> Preview
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          <div className="border border-neutral-800 rounded-xl overflow-hidden">
            {isPreview ? (
              <div className="p-6 prose prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[70vh] bg-zinc-900/50 p-6 text-sm text-gray-100 outline-none resize-none font-mono leading-relaxed"
                placeholder="Write your PRD in markdown..."
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
