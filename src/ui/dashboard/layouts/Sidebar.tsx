import {
	FileText,
	Folder,
	HelpCircle,
	LayoutGrid,
	type LucideIcon,
	Settings,
	X,
} from "lucide-react";
import type { Section } from "#/routes/dashboard/admin";
import { NavItem } from "../components/NavItem";

interface NavItemConfig {
	id: Exclude<Section, undefined>;
	icon: LucideIcon;
}
const navItems: NavItemConfig[] = [
	{ id: "Dashboard", icon: LayoutGrid },
	{ id: "Projects", icon: Folder },
	{ id: "Invoices", icon: FileText },
];

interface SidebarProps {
	currentSection: Section;
	onChangeSection: (section: Section) => void;
	mobileOpen?: boolean;
	onClose?: () => void;
}

function SidebarContent({
	currentSection,
	onChangeSection,
	onClose,
}: {
	currentSection: Section;
	onChangeSection: (section: Section) => void;
	onClose?: () => void;
}) {
	const handleNav = (section: Section) => {
		onChangeSection(section);
		onClose?.();
	};

	return (
		<>
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
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-100 lg:hidden"
							aria-label="Close menu"
						>
							<X size={20} />
						</button>
					)}
				</div>
				<nav className="space-y-1">
					{navItems.map((item) => (
						<NavItem
							key={item.id}
							icon={item.icon}
							label={item.id}
							active={currentSection === item.id}
							onClick={() => handleNav(item.id)}
						/>
					))}
				</nav>
			</div>

			<div className="space-y-3">
				<hr className="border-neutral-800 -mx-4" />
				{/*<button
					type="button"
					onClick={onGenerateInvoice}
					className="w-full bg-white text-black text-sm font-bold rounded-full py-3 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
				>
					<Plus size={16} strokeWidth={2.5} />
					Generate Invoice
				</button>*/}
				<div className="space-y-1 pt-2">
					<NavItem icon={Settings} label="Settings" />
					<NavItem icon={HelpCircle} label="Support" />
				</div>
			</div>
		</>
	);
}

export function Sidebar({
	currentSection,
	onChangeSection,
	mobileOpen,
	onClose,
}: SidebarProps) {
	return (
		<>
			{/* Desktop sidebar */}
			<aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 border-r border-neutral-800/50 flex-col justify-between px-4 py-6">
				<SidebarContent
					currentSection={currentSection}
					onChangeSection={onChangeSection}
				/>
			</aside>

			{/* Mobile slide-out drawer */}
			{mobileOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/60 z-40 lg:hidden"
						onClick={onClose}
						aria-hidden="true"
					/>
					<aside
						className="fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-neutral-800/50 flex flex-col justify-between px-4 py-6 lg:hidden"
						role="dialog"
						aria-modal="true"
					>
						<SidebarContent
							currentSection={currentSection}
							onChangeSection={onChangeSection}
							onClose={onClose}
						/>
					</aside>
				</>
			)}
		</>
	);
}
