import { FileText, Plus } from "lucide-react";

type Resource = { id: string; title: string };

export function ProjectResources({ resources }: { resources: Resource[] }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <span className="text-sm text-gray-100/50">Resources</span>
      {resources.map((r) => (
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
  );
}
