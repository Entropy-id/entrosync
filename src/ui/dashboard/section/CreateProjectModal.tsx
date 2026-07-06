import { useServerFn } from "@tanstack/react-start";
import { FolderPlus, X } from "lucide-react";
import { useState } from "react";
import { createProject } from "#/modules/project/project.api";

interface Props {
	onClose: () => void;
	onCreated: () => void;
}

export function CreateProjectModal({ onClose, onCreated }: Props) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const createProjectFn = useServerFn(createProject);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		if (!title.trim()) {
			setError("Project title is required");
			return;
		}
		setLoading(true);
		try {
			await createProjectFn({
				data: {
					title: title.trim(),
					description: description.trim() || undefined,
				},
			});
			onCreated();
			onClose();
		} catch {
			setError("Failed to create project. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-md bg-zinc-900 border border-neutral-800 rounded-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<FolderPlus size={20} className="text-gray-100" />
						<h2 className="text-lg font-semibold text-white">New Project</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400"
					>
						<X size={18} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="project-title"
							className="block text-sm font-medium text-gray-300 mb-2"
						>
							Project Title
						</label>
						<input
							id="project-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Website Redesign"
							className="w-full bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-sky-500"
						/>
					</div>

					<div>
						<label
							htmlFor="project-description"
							className="block text-sm font-medium text-gray-300 mb-2"
						>
							Description
						</label>
						<textarea
							id="project-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Brief description of the project..."
							rows={4}
							className="w-full bg-zinc-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-sky-500 resize-none"
						/>
					</div>

					{error && (
						<p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
							{error}
						</p>
					)}

					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 border border-neutral-700 text-gray-300 text-sm font-medium rounded-full py-2.5 hover:bg-neutral-800 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 bg-white text-black text-sm font-bold rounded-full py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
						>
							{loading ? "Creating..." : "Create Project"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
