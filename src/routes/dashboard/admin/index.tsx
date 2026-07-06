import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import {
  getSessionWithOnboardingServerFn,
  logoutServerFn,
} from "#/modules/auth/auth.api";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { DashboardSection } from "#/ui/dashboard/section/DashboardSection";
import { InvoicesSection } from "#/ui/dashboard/section/InvoicesSection";
import { ProjectsSection } from "#/ui/dashboard/section/ProjectsSection";

export type Section = "Dashboard" | "Projects" | "Invoices" | undefined;

const searchSchema = z.object({
  tab: z
    .enum(["Dashboard", "Projects", "Invoices"])
    .optional()
    .catch("Dashboard"),
});

export const Route = createFileRoute("/dashboard/admin/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const result = await getSessionWithOnboardingServerFn();

    if (!result) {
      throw redirect({
        to: "/login",
      });
    }

    const { session, onboardingCompleted } = result;
    if (!onboardingCompleted) {
      throw redirect({
        to: "/onboarding",
      });
    }

    return session;
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const logoutHandler = useServerFn(logoutServerFn);
  const session = Route.useRouteContext();
  const { tab } = Route.useSearch();

  async function handleLogout() {
    await logoutHandler();
  }

  const [currentSection, setCurrentSection] = useState<Section>(
    tab ?? "Dashboard",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleChangeSection(section: Section) {
    setCurrentSection(section);
    if (section === "Invoices") {
      setInvoiceInitialView("list");
    }
    navigate({ to: "/dashboard/admin", search: { tab: section } });
  }
  const [invoiceInitialView, setInvoiceInitialView] = useState<
    "list" | "generator"
  >("list");

  // function handleGenerateInvoice() {
  //   setCurrentSection("Invoices");
  //   setInvoiceInitialView("generator");
  //   setMobileMenuOpen(false);
  // }

  return (
    <div className="min-h-screen w-full flex font-inter">
      {/*Sidebar*/}
      <Sidebar
        currentSection={currentSection}
        onChangeSection={handleChangeSection}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/*Main*/}
      <main className="flex-1 min-w-0">
        {/*Top Bar*/}
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          user={session?.user}
          onLogout={handleLogout}
        />

        {/*Content*/}
        <div className="max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          {/*Dashboard Section*/}
          <section className={currentSection === "Dashboard" ? "" : "hidden"}>
            <DashboardSection />
          </section>

          {/*Projects*/}
          <section className={currentSection === "Projects" ? "" : "hidden"}>
            <ProjectsSection />
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
