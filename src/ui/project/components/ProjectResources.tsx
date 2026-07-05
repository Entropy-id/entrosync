import { useNavigate } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { slugify } from "#/modules/project/project.mock";

type Resource = { id: string; title: string };

type Document = {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export function ProjectResources({
  projectTitle,
  resources,
  documents,
}: {
  projectTitle: string;
  resources: Resource[];
  documents: Document[];
}) {
  const navigate = useNavigate();

  const items = documents.length > 0 ? documents : resources;

  return (
    <div className="flex items-center gap-3 mb-10 flex-wrap">
      <span className="text-sm text-gray-100/50">Resources</span>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() =>
            navigate({
              to: "/project/$projectName/document/$documentTitle",
              params: {
                projectName: slugify(projectTitle),
                documentTitle: slugify(item.title),
              },
            })
          }
          className="inline-flex items-center gap-2 text-sm text-gray-100 bg-neutral-800/60 hover:bg-neutral-700/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <FileText size={14} />
          {item.title}
        </button>
      ))}
      <button
        type="button"
        className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
