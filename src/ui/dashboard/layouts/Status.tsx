import {
	Clock,
	FileText,
	Folder,
	Rocket,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
export function Status() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
			<StatCard
				label="TOTAL REVENUE (YTD)"
				value="$142,580.00"
				footer={
					<span className="flex items-center gap-1 text-emerald-400">
						<TrendingUp size={13} /> +12.5% from last month
					</span>
				}
				icon={<Wallet size={56} />}
			/>
			<StatCard
				label="ACTIVE PROJECTS"
				value="14"
				footer={
					<span className="flex items-center gap-1">
						<Rocket size={13} /> 3 reaching milestone this week
					</span>
				}
				icon={<Folder size={56} />}
			/>
			<StatCard
				label="PENDING INVOICES"
				value="08"
				valueClass="text-emerald-400"
				footer={
					<span className="flex items-center gap-1">
						<Clock size={13} /> $12,400 outstanding
					</span>
				}
				icon={<FileText size={56} />}
			/>
		</div>
	);
}
