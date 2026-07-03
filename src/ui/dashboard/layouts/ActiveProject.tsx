import { BarChart2 } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
export function ActiveProject() {
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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
				<ProjectCard
					title="Quantum-X Rebranding"
					client="NexaCorp Industries"
					status="IN PROGRESS"
					statusClass="bg-emerald-500/15 text-emerald-400"
					percent={75}
					avatars={[
						{ img: "https://i.pravatar.cc/64?img=33" },
						{ img: "https://i.pravatar.cc/64?img=47" },
						{ initials: "+2" },
					]}
				/>
				<ProjectCard
					title="Aether Mobile App"
					client="Lumina Systems"
					status="REVIEW"
					statusClass="bg-zinc-700/60 text-zinc-300"
					percent={92}
					avatars={[
						{ img: "https://i.pravatar.cc/64?img=12" },
						{ initials: "JS" },
					]}
				/>
			</div>
		</>
	);
}
