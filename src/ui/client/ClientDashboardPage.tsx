import { useState } from "react";
import {
	LayoutGrid,
	Folder,
	FileText,
	Settings,
	HelpCircle,
	Search,
	Bell,
	Moon,
	CheckCircle2,
	Circle,
	ArrowRight,
	Download,
	Menu,
	X,
} from "lucide-react";
import { StatusBadge } from "#/ui/dashboard/components/StatusBadge";

type Milestone = {
	id: string;
	title: string;
	description: string | null;
	status: string;
	dueDate: string | null;
	tasks: { status: string }[];
};

type Invoice = {
	id: string;
	amount: number;
	status: "PENDING" | "PAID";
	issuedDate: string | null;
};

type Project = {
	id: string;
	title: string;
	description: string | null;
	progress: string;
	status: string;
	dueDate: string | null;
	milestones: Milestone[];
	invoices: Invoice[];
};

function CircularProgress({ percent }: { percent: number }) {
	const radius = 80;
	const stroke = 10;
	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - (percent / 100) * circumference;

	return (
		<div className="relative flex items-center justify-center">
			<svg
				height={radius * 2}
				width={radius * 2}
				className="rotate-[-90deg]"
			>
				<circle
					stroke="#27272a"
					strokeWidth={stroke}
					fill="transparent"
					r={normalizedRadius}
					cx={radius}
					cy={radius}
				/>
				<circle
					stroke="#10b981"
					strokeWidth={stroke}
					strokeDasharray={`${circumference} ${circumference}`}
					style={{ strokeDashoffset }}
					strokeLinecap="round"
					fill="transparent"
					r={normalizedRadius}
					cx={radius}
					cy={radius}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				<span className="text-4xl font-bold text-white">{percent}%</span>
				<span className="text-sm text-gray-400">Complete</span>
			</div>
		</div>
	);
}

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
	return (
		<div className="space-y-6">
			{milestones.map((milestone, index) => {
				const isCompleted = milestone.status === "DONE";
				const isInProgress = milestone.status === "IN_PROGRESS";
				const statusLabel = isCompleted
					? "COMPLETED"
					: isInProgress
						? "IN PROGRESS"
						: "UPCOMING";
				const statusColor = isCompleted
					? "text-emerald-400"
					: isInProgress
						? "text-sky-400"
						: "text-gray-500";

				return (
					<div key={milestone.id} className="flex gap-4">
						<div className="flex flex-col items-center">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
									isCompleted
										? "bg-emerald-500 border-emerald-500 text-white"
										: isInProgress
											? "bg-zinc-800 border-sky-500 text-sky-400"
											: "bg-transparent border-gray-600 text-gray-600"
								}`}
							>
								{isCompleted ? (
									<CheckCircle2 size={16} />
								) : (
									<Circle size={16} />
								)}
							</div>
							{index < milestones.length - 1 && (
								<div className="w-0.5 flex-1 bg-neutral-800 mt-2" />
							)}
						</div>
						<div className="pb-6">
							<h4 className="text-sm font-semibold text-gray-100">
								{milestone.title}
							</h4>
							<p className="text-xs text-gray-400 mt-1 line-clamp-2">
								{milestone.description}
							</p>
							<span
								className={`text-[10px] font-bold tracking-wider mt-2 inline-block ${statusColor}`}
							>
								{statusLabel}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ClientInvoiceTable({ invoices }: { invoices: Invoice[] }) {
	return (
		<div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-neutral-800">
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
							INVOICE ID
						</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
							DATE ISSUED
						</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
							AMOUNT
						</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
							STATUS
						</th>
						<th className="text-right py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">
							ACTION
						</th>
					</tr>
				</thead>
				<tbody>
					{invoices.map((invoice) => (
						<tr
							key={invoice.id}
							className="border-b border-neutral-800/50"
						>
							<td className="py-3.5 px-5 font-mono text-xs text-gray-400">
								INV-{invoice.id.slice(0, 8).toUpperCase()}
							</td>
							<td className="py-3.5 px-5 text-gray-300">
								{invoice.issuedDate
									? new Date(invoice.issuedDate).toLocaleDateString(
											"en-US",
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											},
										)
									: "—"}
							</td>
							<td className="py-3.5 px-5 font-medium text-gray-100">
								$
								{invoice.amount.toLocaleString("en-US", {
									minimumFractionDigits: 2,
								})}
							</td>
							<td className="py-3.5 px-5">
								<StatusBadge status={invoice.status} />
							</td>
							<td className="py-3.5 px-5 text-right">
								<button
									type="button"
									className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-gray-200 transition-colors"
								>
									<Download size={16} />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ClientDashboardPage({ project }: { project: Project }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const totalMilestones = project.milestones.length;
	const completedMilestones = project.milestones.filter(
		(m) => m.status === "DONE",
	).length;
	const percent =
		totalMilestones > 0
			? Math.round((completedMilestones / totalMilestones) * 100)
			: 0;

	const totalTasks = project.milestones.reduce(
		(sum, m) => sum + m.tasks.length,
		0,
	);
	const doneTasks = project.milestones
		.flatMap((m) => m.tasks)
		.filter((t) => t.status === "DONE").length;
	const spentHours = doneTasks * 4;
	const remainingHours = (totalTasks - doneTasks) * 4;

	const isOnTrack =
		project.status === "DONE" ||
		!project.milestones.some(
			(m) =>
				m.status !== "DONE" && m.dueDate && new Date(m.dueDate) < new Date(),
		);

	return (
		<div className="min-h-screen w-full flex font-inter bg-zinc-950 text-gray-100">
			{/* Sidebar */}
			<aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 border-r border-neutral-800/50 flex-col justify-between px-4 py-6">
				<div>
					<div className="flex items-center gap-2 px-2 mb-8">
						<img
							src="/logo_entrosync.svg"
							alt="EntroSync Logo"
							className="w-8 h-8"
						/>
						<span className="font-semibold text-lg">EntroSync</span>
					</div>
					<nav className="space-y-1">
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-800/60 text-white">
							<LayoutGrid size={18} />
							<span className="text-sm font-medium">Dashboard</span>
						</div>
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
							<Folder size={18} />
							<span className="text-sm font-medium">Projects</span>
						</div>
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
							<FileText size={18} />
							<span className="text-sm font-medium">Invoices</span>
						</div>
					</nav>
				</div>
				<div className="space-y-3">
					<hr className="border-neutral-800 -mx-4" />
					<div className="space-y-1 pt-2">
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
							<Settings size={18} />
							<span className="text-sm font-medium">Settings</span>
						</div>
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-neutral-800/40 hover:text-gray-200 transition-colors cursor-default">
							<HelpCircle size={18} />
							<span className="text-sm font-medium">Support</span>
						</div>
					</div>
				</div>
			</aside>

			{/* Mobile sidebar overlay */}
			{mobileMenuOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/60 z-40 lg:hidden"
						onClick={() => setMobileMenuOpen(false)}
						aria-hidden="true"
					/>
					<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-neutral-800/50 flex flex-col justify-between px-4 py-6 lg:hidden">
						<div>
							<div className="flex items-center justify-between px-2 mb-8">
								<div className="flex items-center gap-2">
									<img
										src="/logo_entrosync.svg"
										alt="EntroSync Logo"
										className="w-8 h-8"
									/>
									<span className="font-semibold text-lg">EntroSync</span>
								</div>
								<button
									type="button"
									onClick={() => setMobileMenuOpen(false)}
									className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100"
									aria-label="Close menu"
								>
									<X size={20} />
								</button>
							</div>
							<nav className="space-y-1">
								<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-800/60 text-white">
									<LayoutGrid size={18} />
									<span className="text-sm font-medium">Dashboard</span>
								</div>
							</nav>
						</div>
					</aside>
				</>
			)}

			{/* Main */}
			<main className="flex-1 min-w-0">
				{/* Topbar */}
				<div className="sticky top-0 z-10 bg-zinc-950 border-b border-neutral-800 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
					<div className="flex items-center gap-3 sm:gap-4">
						<button
							type="button"
							onClick={() => setMobileMenuOpen(true)}
							className="p-2 rounded-lg hover:bg-neutral-800 text-gray-100 lg:hidden"
							aria-label="Open menu"
						>
							<Menu size={20} />
						</button>
						<div className="flex-1 flex items-center gap-3 bg-zinc-950/50 border border-neutral-800 rounded-full px-3 py-2 sm:px-4 sm:py-2.5">
							<Search
								size={16}
								className="text-neutral-100/80 shrink-0"
							/>
							<input
								className="bg-transparent outline-none text-sm placeholder:text-gray-100/80 w-full min-w-0"
								placeholder="Search portal..."
								readOnly
							/>
						</div>
						<div className="flex items-center gap-1 sm:gap-2">
							<button
								type="button"
								className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100 relative"
							>
								<Bell size={18} />
								<span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
							</button>
							<button
								type="button"
								className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-800 text-gray-100"
							>
								<Moon size={18} />
							</button>
						</div>
						<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-medium">
							CL
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
					{/* Header */}
					<div className="flex items-start justify-between mb-8">
						<div>
							<h1 className="text-2xl font-bold text-white">Overview</h1>
							<p className="text-sm text-gray-400 mt-1">
								Status check for{" "}
								<span className="text-gray-200 font-medium">
									{project.title}
								</span>
							</p>
						</div>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
								project.status === "DONE"
									? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
									: isOnTrack
										? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
										: "bg-red-500/10 text-red-400 border-red-500/20"
								}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									project.status === "DONE" || isOnTrack
										? "bg-emerald-400"
										: "bg-red-400"
									}`}
							/>
							{project.status === "DONE"
								? "Project completed"
								: isOnTrack
									? "Project is on track"
									: "Project off track"}
						</span>
					</div>

					{/* Main Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
						{/* Progress Card */}
						<div className="lg:col-span-2 bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6 sm:p-8">
							<h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8 text-center">
								Your Project Progress
							</h3>
							<div className="flex justify-center mb-8">
								<CircularProgress percent={percent} />
							</div>
							<div className="grid grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
								<div className="text-center">
									<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">
										Spent
									</p>
									<p className="text-lg font-semibold text-white">
										{spentHours}h
									</p>
								</div>
								<div className="text-center border-l border-neutral-800">
									<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">
										Remaining
									</p>
									<p className="text-lg font-semibold text-white">
										{remainingHours}h
									</p>
								</div>
								<div className="text-center border-l border-neutral-800">
									<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">
										Deadline
									</p>
									<p className="text-lg font-semibold text-white">
										{project.dueDate
											? new Date(project.dueDate).toLocaleDateString(
													"en-US",
													{
														month: "short",
														day: "numeric",
													},
												)
											: "—"}
									</p>
								</div>
							</div>
						</div>

						{/* Milestones Card */}
						<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-sm font-semibold text-white">
									Active Milestones
								</h3>
								<ArrowRight
									size={16}
									className="text-gray-400"
								/>
							</div>
							<MilestoneTimeline milestones={project.milestones} />
						</div>
					</div>

					{/* Invoices Section */}
					<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-sm font-semibold text-white">
								Recent Invoices
							</h3>
							<button
								type="button"
								className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
							>
								View All
							</button>
						</div>
						{project.invoices.length > 0 ? (
							<ClientInvoiceTable invoices={project.invoices} />
						) : (
							<div className="text-center py-12 text-gray-500 text-sm">
								No invoices yet
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
