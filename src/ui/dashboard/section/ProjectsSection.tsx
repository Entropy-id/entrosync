import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FolderPlus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteProject, getProjects } from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import { CreateProjectModal } from "./CreateProjectModal";

interface ProjectRow {
	id: string;
	title: string;
	description?: string | null;
	status: string;
	progress: string;
	startDate?: string | null;
	dueDate?: string | null;
	createdAt: string;
	updatedAt: string;
	milestones: {
		id: string;
		title: string;
		status: string;
		startDate: string;
		dueDate: string;
		tasks: { id: string; title: string; status: string }[];
	}[];
}

function getPriorityStyle(_status: string) {
	// Map project status to a color badge
	switch (_status) {
		case "ON_PROGRESS":
			return "bg-sky-500 text-white";
		case "DONE":
			return "bg-emerald-500 text-white";
		default:
			return "bg-neutral-700 text-gray-100";
	}
}

function getPriorityLabel(status: string) {
	switch (status) {
		case "ON_PROGRESS":
			return "In Progress";
		case "DONE":
			return "Completed";
		default:
			return "Not Started";
	}
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function ProjectsSection() {
	const navigate = useNavigate();
	const getProjectsFn = useServerFn(getProjects);
	const deleteProjectFn = useServerFn(deleteProject);
	const [projects, setProjects] = useState<ProjectRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const loadProjects = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getProjectsFn();
			setProjects(data as ProjectRow[]);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [getProjectsFn]);

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);

	function handleRowClick(name: string) {
		const slug = slugify(name);
		navigate({ to: "/project/$projectName", params: { projectName: slug } });
	}

	async function handleDelete(e: React.MouseEvent, project: ProjectRow) {
		e.stopPropagation();
		const confirmed = window.confirm(
			`Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
		);
		if (!confirmed) return;

		setDeletingId(project.id);
		try {
			await deleteProjectFn({ data: { id: project.id } });
			setProjects((prev) => prev.filter((p) => p.id !== project.id));
		} catch (err) {
			console.error("Failed to delete project", err);
			alert("Failed to delete project. Please try again.");
		} finally {
			setDeletingId(null);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<span className="text-sm text-gray-100/50">Loading projects...</span>
			</div>
		);
	}

	return (
		<div>
			{/* Heading */}
			<div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
				<h1 className="text-2xl font-bold text-gray-100">Projects</h1>
				<button
					type="button"
					onClick={() => setCreateModalOpen(true)}
					className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold rounded-full px-4 py-2.5 hover:bg-zinc-200 transition-colors"
				>
					<FolderPlus size={16} />
					New Project
				</button>
			</div>

			{projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 gap-4">
					<div className="bg-neutral-800/50 rounded-full p-4">
						<FolderPlus size={32} className="text-gray-400" />
					</div>
					<p className="text-sm text-gray-100/50">No projects found.</p>
					<button
						type="button"
						onClick={() => setCreateModalOpen(true)}
						className="text-sm text-sky-400 hover:text-sky-300 font-medium"
					>
						Create your first project
					</button>
				</div>
			) : (
				<>
					{/* Filter pill */}
					<div className="mb-6">
						<span className="inline-flex items-center bg-neutral-800 text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full">
							All Projects
						</span>
					</div>

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left">
									<th className="text-sm text-gray-100 font-semibold py-4 px-4">
										Name
									</th>
									<th className="text-sm text-gray-100 font-semibold py-4 px-4">
										Priority
									</th>
									<th className="text-sm text-gray-100 font-semibold py-4 px-4">
										Target Date
									</th>
									<th className="text-sm text-gray-100 font-semibold py-4 px-4">
										Tasks
									</th>
									<th className="text-sm text-gray-100 font-semibold py-4 px-4">
										Status
									</th>
									<th className="text-sm text-gray-100 font-semibold py-4 px-4 w-16"></th>
								</tr>
							</thead>
							<tbody>
								{projects.map((project) => {
									const totalTasks = project.milestones.reduce(
										(sum, m) => sum + m.tasks.length,
										0,
									);

									const targetDate = project.dueDate
										? formatDate(project.dueDate)
										: "-";

									return (
										<tr
											key={project.id}
											onClick={() => handleRowClick(project.title)}
											className="border-b border-neutral-800/40 text-sm text-gray-100/80 cursor-pointer hover:bg-neutral-800/40 transition-colors group"
										>
											<td className="py-4 px-4">{project.title}</td>
											<td className="py-4 px-4">
												<span
													className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${getPriorityStyle(project.status)}`}
												>
													{getPriorityLabel(project.status)}
												</span>
											</td>
											<td className="py-4 px-4">{targetDate}</td>
											<td className="py-4 px-4">{totalTasks}</td>
											<td className="py-4 px-4">{project.progress}</td>
											<td className="py-4 px-4">
												<button
													type="button"
													onClick={(e) => handleDelete(e, project)}
													disabled={deletingId === project.id}
													className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
													title="Delete project"
												>
													<Trash2 size={16} />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</>
			)}

			{createModalOpen && (
				<CreateProjectModal
					onClose={() => setCreateModalOpen(false)}
					onCreated={loadProjects}
				/>
			)}
		</div>
	);
}
