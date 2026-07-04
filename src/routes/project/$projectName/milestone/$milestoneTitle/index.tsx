import { getSessionServerFn } from "#/modules/auth/auth.api";
import { getProjectBySlug, slugify } from "#/modules/project/project.mock";
import type { Section } from "#/routes/dashboard/admin";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import {
	createFileRoute,
	notFound,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useCallback } from "react";

export const Route = createFileRoute(
	"/project/$projectName/milestone/$milestoneTitle/",
)({
	component: MilestoneDetailPage,
	beforeLoad: async () => {
		const session = await getSessionServerFn();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return session;
	},
	loader: ({ params }) => {
		const project = getProjectBySlug(params.projectName);
		if (!project) throw notFound();
		const milestone = project.milestones.find(
			(m) => slugify(m.title) === params.milestoneTitle,
		);
		if (!milestone) throw notFound();
		return { project, milestone };
	},
});

function MilestoneDetailPage() {
	const navigate = useNavigate();
	const { project, milestone } = Route.useLoaderData();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const [title, setTitle] = useState(milestone.title);
	const [description, setDescription] = useState(milestone.description);
	const [editingTitle, setEditingTitle] = useState(false);
	const [editingDesc, setEditingDesc] = useState(false);

	const titleInputRef = useRef<HTMLInputElement>(null);
	const descTextareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSaveTitle = useCallback(() => {
		setEditingTitle(false);
		// TODO: call API to persist change
	}, []);

	const handleSaveDescription = useCallback(() => {
		setEditingDesc(false);
		// TODO: call API to persist change
	}, []);

	function handleChangeSection(_section: Section) {
		navigate({ to: "/dashboard/admin", search: { tab: "Projects" } });
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
				<Topbar onMenuClick={() => setMobileMenuOpen(true)} />

				{/* Breadcrumb */}
				<div className="max-w-6xl mx-auto px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
					<nav className="text-sm text-gray-100/50 mb-6">
						<button
							onClick={() =>
								navigate({
									to: "/dashboard/admin",
									search: { tab: "Projects" },
								})
							}
							className="hover:text-gray-100 transition-colors"
						>
							Projects
						</button>
						<span className="mx-1">&gt;</span>
						<button
							onClick={() =>
								navigate({
									to: "/project/$projectName",
									params: { projectName: slugify(project.name) },
								})
							}
							className="hover:text-gray-100 transition-colors"
						>
							{project.name}
						</button>
						<span className="mx-1">&gt;</span>
						<span className="text-gray-100 font-medium">{title}</span>
					</nav>
				</div>

				{/* Content */}
				<div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-8">
						{/* Left column */}
						<div className="flex-1 min-w-0">
							{/* Editable title */}
							<div className="group flex items-center gap-3 mb-4">
								{editingTitle ? (
									<input
										ref={titleInputRef}
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										onBlur={handleSaveTitle}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveTitle();
										}}
										autoFocus
										className="bg-transparent text-3xl font-bold text-gray-100 outline-none border-b border-neutral-700 focus:border-sky-500 w-full pb-1"
									/>
								) : (
									<>
										<h1 className="text-3xl font-bold">{title}</h1>
										<button
											onClick={() => {
												setEditingTitle(true);
												setTimeout(
													() => titleInputRef.current?.focus(),
													0,
												);
											}}
											className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-all"
										>
											<Pencil size={14} />
										</button>
									</>
									)}
								</div>

							{/* Meta */}
							<div className="flex items-center gap-2 text-xs text-gray-100/40 mb-8">
								<span>{milestone.date}</span>
								<span>•</span>
								<span>{milestone.tasks} Task</span>
								<span>•</span>
								<span>{milestone.completion}</span>
							</div>

							{/* Editable description */}
							<div className="mb-10">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-base font-semibold text-gray-100">
										Description
									</h2>
									{!editingDesc && (
										<button
											onClick={() => {
												setEditingDesc(true);
												setTimeout(
													() =>
														descTextareaRef.current?.focus(),
													0,
												);
											}}
											className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100/50 hover:text-gray-100 transition-colors"
										>
											<Pencil size={14} />
										</button>
									)}
								</div>

								{editingDesc ? (
									<div className="space-y-3">
										<textarea
											ref={descTextareaRef}
											value={description}
											onChange={(e) =>
												setDescription(e.target.value)
											}
											rows={10}
											className="w-full bg-zinc-900/80 border border-neutral-700 rounded-xl p-4 text-sm text-gray-100 outline-none focus:border-sky-500 resize-y font-mono leading-6"
										/>
										<div className="flex items-center gap-2">
											<button
												onClick={handleSaveDescription}
												className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
											>
												Save
											</button>
											<button
												onClick={() => setEditingDesc(false)}
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
						</div>

						{/* Right sidebar */}
						<div className="w-full lg:w-72 shrink-0 space-y-4">
							<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
								<h3 className="text-sm font-semibold text-gray-100 mb-4">
									Details
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-100/50">
											Project
										</span>
										<span className="text-sm text-gray-100">
											{project.name}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-100/50">Date</span>
										<span className="text-sm text-gray-100">
											{milestone.date}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-100/50">Tasks</span>
										<span className="text-sm text-gray-100 font-medium">
											{milestone.tasks}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-100/50">
											Completion
										</span>
										<span className="text-sm text-gray-100 font-medium">
											{milestone.completion}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
