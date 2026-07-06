import { ArrowRight } from "lucide-react";
import { InvoiceDownloadButton } from "#/ui/invoice/components/InvoiceDownloadButton";
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

type FreelancerInfo = {
	name: string;
	email: string | null;
};

type Project = {
	id: string;
	title: string;
	status: string;
	dueDate: string | null;
	freelancer: FreelancerInfo | null;
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
			<svg height={radius * 2} width={radius * 2} className="-rotate-90">
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
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								) : (
									<div className="w-3 h-3 rounded-full bg-current" />
								)}
							</div>
							{index < milestones.length - 1 && (
								<div className="w-0.5 flex-1 bg-neutral-800 mt-2" />
							)}
						</div>
						<div className="pb-6">
							<h4 className="text-sm font-semibold text-gray-100">{milestone.title}</h4>
							<p className="text-xs text-gray-400 mt-1 line-clamp-2">{milestone.description}</p>
							<span className={`text-[10px] font-bold tracking-wider mt-2 inline-block ${statusColor}`}>
								{statusLabel}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ClientInvoiceTable({
	invoices,
	projectTitle,
	freelancerName,
}: {
	invoices: Invoice[];
	projectTitle: string;
	freelancerName?: string;
}) {
	return (
		<div className="rounded-2xl bg-zinc-900/50 border border-neutral-800 overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-neutral-800">
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">INVOICE ID</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">DATE ISSUED</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">AMOUNT</th>
						<th className="text-left py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">STATUS</th>
						<th className="text-right py-3.5 px-5 text-xs font-medium text-gray-400 tracking-wider">ACTION</th>
					</tr>
				</thead>
				<tbody>
					{invoices.map((invoice) => (
						<tr key={invoice.id} className="border-b border-neutral-800/50">
							<td className="py-3.5 px-5 font-mono text-xs text-gray-400">
								INV-{invoice.id.slice(0, 8).toUpperCase()}
							</td>
							<td className="py-3.5 px-5 text-gray-300">
								{invoice.issuedDate
									? new Date(invoice.issuedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
									: "—"}
							</td>
							<td className="py-3.5 px-5 font-medium text-gray-100">
								${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
							</td>
							<td className="py-3.5 px-5">
								<StatusBadge status={invoice.status} />
							</td>
							<td className="py-3.5 px-5 text-right">
								<InvoiceDownloadButton
									id={invoice.id}
									amount={invoice.amount}
									status={invoice.status}
									issuedDate={invoice.issuedDate}
									projectTitle={projectTitle}
									freelancerName={freelancerName}
									size="sm"
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ClientOverviewPage({ project }: { project: Project }) {
	const totalMilestones = project.milestones.length;
	const completedMilestones = project.milestones.filter((m) => m.status === "DONE").length;
	const percent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

	const totalTasks = project.milestones.reduce((sum, m) => sum + m.tasks.length, 0);
	const doneTasks = project.milestones.flatMap((m) => m.tasks).filter((t) => t.status === "DONE").length;
	const spentHours = doneTasks * 4;
	const remainingHours = (totalTasks - doneTasks) * 4;

	const isOnTrack =
		project.status === "DONE" ||
		!project.milestones.some((m) => m.status !== "DONE" && m.dueDate && new Date(m.dueDate) < new Date());

	return (
		<>
			{/* Status badge */}
			<div className="flex items-start justify-between mb-8">
				<div />
				<span
					className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
						project.status === "DONE"
							? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
							: isOnTrack
								? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
								: "bg-red-500/10 text-red-400 border-red-500/20"
					}`}
				>
					<span className={`w-1.5 h-1.5 rounded-full ${project.status === "DONE" || isOnTrack ? "bg-emerald-400" : "bg-red-400"}`} />
					{project.status === "DONE" ? "Project completed" : isOnTrack ? "Project is on track" : "Project off track"}
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
							<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">Spent</p>
							<p className="text-lg font-semibold text-white">{spentHours}h</p>
						</div>
						<div className="text-center border-l border-neutral-800">
							<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">Remaining</p>
							<p className="text-lg font-semibold text-white">{remainingHours}h</p>
						</div>
						<div className="text-center border-l border-neutral-800">
							<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">Deadline</p>
							<p className="text-lg font-semibold text-white">
								{project.dueDate ? new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
							</p>
						</div>
					</div>
				</div>

				{/* Milestones Card */}
				<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-sm font-semibold text-white">Active Milestones</h3>
						<ArrowRight size={16} className="text-gray-400" />
					</div>
					<MilestoneTimeline milestones={project.milestones} />
				</div>
			</div>

			{/* Invoices Section */}
			<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-sm font-semibold text-white">Recent Invoices</h3>
				</div>
				{project.invoices.length > 0 ? (
					<ClientInvoiceTable
						invoices={project.invoices}
						projectTitle={project.title}
						freelancerName={project.freelancer?.name ?? undefined}
					/>
				) : (
					<div className="text-center py-12 text-gray-500 text-sm">No invoices yet</div>
				)}
			</div>
		</>
	);
}
