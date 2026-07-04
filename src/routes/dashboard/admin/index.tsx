import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSessionServerFn, logoutServerFn } from "#/modules/auth/auth.api";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { DashboardSection } from "#/ui/dashboard/section/DashboardSection";
import { InvoicesSection } from "#/ui/dashboard/section/InvoicesSection";

export type Section = "Dashboard" | "Projects" | "Invoices";
export const Route = createFileRoute("/dashboard/admin/")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getSessionServerFn();

		if (!session) {
			throw redirect({
				to: "/login",
			});
		}

		return session;
	},
});

function RouteComponent() {
	const logoutServerFnHandler = useServerFn(logoutServerFn);
	const _session = Route.useRouteContext();

	async function _handleLogout() {
		await logoutServerFnHandler();
	}

	const [currentSection, setCurrentSection] = useState<Section>("Dashboard");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const [invoiceInitialView, setInvoiceInitialView] = useState<
		"list" | "generator"
	>("list");

	function handleGenerateInvoice() {
		setCurrentSection("Invoices");
		setInvoiceInitialView("generator");
		setMobileMenuOpen(false);
	}

	return (
		<div className="min-h-screen w-full flex font-inter">
			{/*Sidebar*/}
			<Sidebar
				currentSection={currentSection}
				onChangeSection={(section) => {
					setCurrentSection(section);
					if (section === "Invoices") {
						setInvoiceInitialView("list");
					}
				}}
				onGenerateInvoice={handleGenerateInvoice}
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
						<InvoicesSection initialSubView={invoiceInitialView} />
					</section>
				</div>
			</main>
		</div>
	);
}
