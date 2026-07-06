import type { ReactNode } from "react";

interface ActivityRowProps {
	icon: ReactNode;
	iconBg: string;
	title: string;
	desc: string;
	time: string;
	last?: boolean;
}

export function ActivityRow({
	icon,
	iconBg,
	title,
	desc,
	time,
	last,
}: ActivityRowProps) {
	return (
		<div
			className={`flex items-start justify-between py-4 ${
				!last ? "border-b border-zinc-800/80" : ""
			}`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
				>
					{icon}
				</div>
				<div>
					<p className="text-sm font-medium text-white">{title}</p>
					<p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
				</div>
			</div>
			<span className="text-xs text-zinc-500 whitespace-nowrap ml-4">
				{time}
			</span>
		</div>
	);
}
