import { InvoiceDownloadButton } from "#/ui/invoice/components/InvoiceDownloadButton";
import { StatusBadge } from "#/ui/dashboard/components/StatusBadge";

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
	freelancer: FreelancerInfo | null;
	invoices: Invoice[];
};

export function ClientInvoicesPage({ project }: { project: Project }) {
	const totalAmount = project.invoices.reduce((sum, inv) => sum + inv.amount, 0);
	const paidAmount = project.invoices
		.filter((inv) => inv.status === "PAID")
		.reduce((sum, inv) => sum + inv.amount, 0);
	const pendingAmount = project.invoices
		.filter((inv) => inv.status === "PENDING")
		.reduce((sum, inv) => sum + inv.amount, 0);

	return (
		<div className="space-y-8">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
					<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2">
						Total Billed
					</p>
					<p className="text-2xl font-semibold text-white">
						${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
					</p>
				</div>
				<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
					<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2">
						Paid
					</p>
					<p className="text-2xl font-semibold text-emerald-400">
						${paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
					</p>
				</div>
				<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl p-5">
					<p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2">
						Outstanding
					</p>
					<p className="text-2xl font-semibold text-sky-400">
						${pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
					</p>
				</div>
			</div>

			{/* Invoices Table */}
			<div className="bg-zinc-900/50 border border-neutral-800 rounded-2xl overflow-x-auto">
				{project.invoices.length > 0 ? (
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
							{project.invoices.map((invoice) => (
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
										<InvoiceDownloadButton
											id={invoice.id}
											amount={invoice.amount}
											status={invoice.status}
											issuedDate={invoice.issuedDate}
											projectTitle={project.title}
											freelancerName={
												project.freelancer?.name ?? undefined
											}
											size="sm"
										/>
									</td>
								</tr>
							))}
							</tbody>
						</table>
					) : (
						<div className="text-center py-16 text-gray-500 text-sm">
							No invoices yet
						</div>
					)
				}
			</div>
		</div>
	);
}
