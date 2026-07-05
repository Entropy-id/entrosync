import { Copyright, Menu } from "lucide-react";

interface BrandingCardProps {
	title: string;
	description: string;
	align?: "left" | "right";
}

export function BrandingCard({
	title,
	description,
	align = "left",
}: BrandingCardProps) {
	return (
		<div
			className={`flex flex-col justify-between h-full ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
		>
			{/* Logo */}
			<div
				className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
			>
				<img
					src="/logo_entrosync.svg"
					alt="EntroSync Logo"
					className="w-8 h-8"
				/>
				<span className="font-semibold text-lg">EntroSync</span>
			</div>
			{/* Branding Text */}
			<div className="max-w-md">
				<h1 className="text-4xl font-bold mb-4">{title}</h1>
				<p className="text-gray-400 text-lg leading-relaxed">{description}</p>
			</div>
			{/* Copyright */}
			<div
				className={`flex items-center gap-1 text-sm text-gray-500 ${align === "right" ? "flex-row-reverse" : ""}`}
			>
				<Copyright size={12} />
				<span>2026 ENTROSYNC</span>
			</div>
		</div>
	);
}
