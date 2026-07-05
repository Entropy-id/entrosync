import { Link } from "@tanstack/react-router";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { slugify } from "#/modules/project/project.mock";
import type { MilestoneDraft } from "../hooks/useMilestones";

export function ProjectMilestones({
	milestones,
	editingMilestoneId,
	draftMilestone,
	setDraftMilestone,
	handleCreate,
	handleEdit,
	handleSave,
	handleDelete,
	handleCancel,
	projectTitle,
	projectId,
}: {
	milestones: MilestoneDraft[];
	editingMilestoneId: number | "new" | null;
	draftMilestone: MilestoneDraft;
	setDraftMilestone: React.Dispatch<React.SetStateAction<MilestoneDraft>>;
	handleCreate: () => void;
	handleEdit: (index: number) => void;
	handleSave: (
		data: Record<string, unknown>,
		rollback: () => void,
	) => Promise<void>;
	handleDelete: (index: number) => Promise<void>;
	handleCancel: () => void;
	projectTitle: string;
	projectId: string;
}) {
	const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpenMenuIndex(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-base font-semibold text-gray-100">Milestones</h2>
				<button
					type="button"
					onClick={handleCreate}
					className="inline-flex items-center gap-1.5 text-sm text-gray-100/50 hover:text-gray-100 transition-colors"
				>
					<Plus size={14} />
					Create Milestone
				</button>
			</div>

			{/* New milestone form */}
			{editingMilestoneId === "new" && (
				<div className="bg-zinc-900/50 border border-neutral-800 rounded-xl p-4 mb-6 space-y-3">
					<input
						type="text"
						placeholder="Milestone name"
						value={draftMilestone.title}
						onChange={(e) =>
							setDraftMilestone((d) => ({
								...d,
								title: e.target.value,
								projectId: projectId,
							}))
						}
						className="w-full bg-transparent text-sm font-semibold text-gray-100 placeholder:text-gray-100/30 outline-none border-b border-neutral-700 focus:border-sky-500 pb-1"
					/>
					<textarea
						placeholder="Milestone description..."
						value={draftMilestone.description}
						onChange={(e) =>
							setDraftMilestone((d) => ({
								...d,
								description: e.target.value,
								projectId: projectId,
							}))
						}
						rows={3}
						className="w-full bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-100/30 outline-none focus:border-sky-500 resize-y"
					/>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								handleSave(draftMilestone, () => console.log("rollback"));
							}}
							className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
						>
							Save
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{milestones.map((m, i) => (
					<div key={`${m.title}-${m.id}`} className="group">
						{editingMilestoneId === i ? (
							<div className="bg-zinc-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
								<input
									type="text"
									value={draftMilestone.title}
									onChange={(e) =>
										setDraftMilestone((d) => ({
											...d,
											title: e.target.value,
										}))
									}
									className="w-full bg-transparent text-sm font-semibold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 pb-1"
								/>
								<textarea
									value={draftMilestone.description}
									onChange={(e) =>
										setDraftMilestone((d) => ({
											...d,
											description: e.target.value,
										}))
									}
									rows={3}
									className="w-full bg-zinc-900/80 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y"
								/>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => {
											handleSave(draftMilestone, () => console.log("rollback"));
										}}
										className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
									>
										Save
									</button>
									<button
										type="button"
										onClick={handleCancel}
										className="text-sm text-gray-100/50 hover:text-gray-100 px-4 py-2"
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<Link
								to="/project/$projectName/milestone/$milestoneTitle"
								params={{
									projectName: slugify(projectTitle),
									milestoneTitle: slugify(m.title),
								}}
							>
								<div className="relative cursor-pointer hover:bg-neutral-800/30 rounded-xl p-3 -mx-3 transition-colors">
									<div className="flex items-center justify-between mb-1">
										<h3 className="text-sm font-semibold text-gray-100">
											{m.title}
										</h3>
										<div className="flex items-center gap-2 text-xs text-gray-100/40">
											<span>{m.date}</span>
											<span>•</span>
											<span>{m.tasks} Task</span>
											<span>•</span>
											<span>{m.completion}</span>
											{/* Dropdown menu */}
											<div ref={openMenuIndex === i ? menuRef : null}>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setOpenMenuIndex(openMenuIndex === i ? null : i);
													}}
													className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/70 hover:text-gray-100"
												>
													<EllipsisVertical size={14} />
												</button>
												{openMenuIndex === i && (
													<div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden z-10">
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																setOpenMenuIndex(null);
																handleEdit(i);
															}}
															className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-100 hover:bg-neutral-800 transition-colors"
														>
															<Pencil size={12} />
															Edit
														</button>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																setOpenMenuIndex(null);
																handleDelete(i);
															}}
															className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
														>
															<Trash2 size={12} />
															Delete
														</button>
													</div>
												)}
											</div>
										</div>
									</div>
									<p className="text-sm text-gray-100/50 line-clamp-2">
										{m.description}
									</p>
								</div>
							</Link>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
