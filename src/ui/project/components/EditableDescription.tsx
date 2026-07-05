import { useRef, useState, useCallback } from "react";
import { Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { updateProject } from "#/modules/project/project.api";

export function EditableDescription({
  projectId,
  initialDescription,
}: {
  projectId: string;
  initialDescription: string | null;
}) {
  const [description, setDescription] = useState(initialDescription || "");
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateProjectFn = useServerFn(updateProject);

  const handleSave = useCallback(async () => {
    setEditing(false);
    if (description === initialDescription) return;
    try {
      await updateProjectFn({
        data: { id: projectId, description },
      });
    } catch (err) {
      console.error("Failed to update project description", err);
      setDescription(initialDescription ?? "");
    }
  }, [description, projectId, initialDescription, updateProjectFn]);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-100">Description</h2>
        {!editing && (
          <button
            onClick={() => {
              setEditing(true);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            className="w-full bg-zinc-900/80 border border-neutral-700 rounded-xl p-4 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y font-mono leading-6"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
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
  );
}
