import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { DashboardSection } from "#/ui/dashboard/section/DashboardSection";
export type Section = "Dashboard" | "Projects" | "Invoices";
export const Route = createFileRoute("/dashboard/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [currentSection, setCurrentSection] = useState<Section>("Dashboard");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen w-full flex font-inter">
			{/*Sidebar*/}
			<Sidebar
				currentSection={currentSection}
				onChangeSection={setCurrentSection}
				mobileOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
			/>

			{/*Main*/}
			<main className="flex-1 min-w-0">
				{/*Top Bar*/}
				<Topbar onMenuClick={() => setMobileMenuOpen(true)} />

				{/*Content*/}
				<div className="max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
					{/*Dashboard Section*/}
					<section className={currentSection === "Dashboard" ? "" : "hidden"}>
						<DashboardSection />
					</section>

					{/*Projects*/}
					<section className={currentSection === "Projects" ? "" : "hidden"}>
						Projects Section
					</section>
					{/*Invoices*/}
					<section className={currentSection === "Invoices" ? "" : "hidden"}>
						Invoices Section
					</section>
				</div>
			</main>
		</div>
	);
}
