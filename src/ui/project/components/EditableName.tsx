import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { updateProject } from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";

export function EditableName({
	projectId,
	initialName,
}: {
	projectId: string;
	initialName: string;
}) {
	const [name, setName] = useState(initialName);
	const [editing, setEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const updateProjectFn = useServerFn(updateProject);
	const navigate = useNavigate();

	const handleSave = useCallback(async () => {
		setEditing(false);
		if (name === initialName) return;
		try {
			await updateProjectFn({ data: { id: projectId, title: name } });
			const slug = slugify(name);
			navigate({ to: "/project/$projectName", params: { projectName: slug } });
		} catch (err) {
			console.error("Failed to update project name", err);
			setName(initialName);
		}
	}, [name, projectId, initialName, updateProjectFn, navigate]);

	if (editing) {
		return (
			<input
				ref={inputRef}
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onBlur={handleSave}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSave();
				}}
				className="bg-transparent text-3xl font-bold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 w-full pb-1"
			/>
		);
	}

	return (
		<div className="group flex items-center gap-3 mb-4">
			<h1 className="text-3xl font-bold">{name}</h1>
			<button
				type="button"
				onClick={() => {
					setEditing(true);
					setTimeout(() => inputRef.current?.focus(), 0);
				}}
				className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-all"
			>
				<Pencil size={14} />
			</button>
		</div>
	);
}
