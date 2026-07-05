import { useServerFn } from "@tanstack/react-start";
import { BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProjects } from "#/modules/project/project.api";
import { ProjectCard } from "../components/ProjectCard";

interface ProjectRow {
	id: string;
	title: string;
	client?: { name: string } | null;
	status: string;
	progress: string;
}

function parsePercent(progress: string): number {
	const num = Number.parseInt(progress.replace("%", ""), 10);
	return Number.isNaN(num) ? 0 : num;
}

function getStatusClass(status: string) {
	switch (status) {
		case "ON_PROGRESS":
			return "bg-emerald-500/15 text-emerald-400";
		case "DONE":
			return "bg-sky-500/15 text-sky-400";
		default:
			return "bg-zinc-700/60 text-zinc-300";
	}
}

function getStatusLabel(status: string) {
	switch (status) {
		case "ON_PROGRESS":
			return "IN PROGRESS";
		case "DONE":
			return "COMPLETED";
		default:
			return "NOT STARTED";
	}
}

export function ActiveProject() {
	const getProjectsFn = useServerFn(getProjects);
	const [projects, setProjects] = useState<ProjectRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProjectsFn()
			.then((data) => {
				const active = (data as ProjectRow[]).filter(
					(p) => p.status === "ON_PROGRESS",
				);
				setProjects(active.slice(0, 4));
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [getProjectsFn]);

	return (
		<>
			<div className="flex items-center justify-between mb-4">
				<h2 className="flex items-center gap-2 text-lg font-semibold">
					<BarChart2 size={18} /> Active Projects
				</h2>
				<button
					type="button"
					className="text-sm text-gray-100/50 hover:text-gray-100"
				>
					View All
				</button>
			</div>
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
					<div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5 h-40 animate-pulse" />
					<div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 p-5 h-40 animate-pulse" />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
					{projects.length === 0 ? (
						<p className="text-sm text-gray-500">No active projects.</p>
					) : (
						projects.map((project) => (
							<ProjectCard
								key={project.id}
								title={project.title}
								client={project.client?.name ?? "Unknown Client"}
								status={getStatusLabel(project.status)}
								statusClass={getStatusClass(project.status)}
								percent={parsePercent(project.progress)}
							/>
						))
					)}
				</div>
			)}
		</>
	);
}
