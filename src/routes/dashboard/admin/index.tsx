import { getSessionServerFn, logoutServerFn } from "#/modules/auth/auth.api";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { DashboardSection } from "#/ui/dashboard/section/DashboardSection";
import { ProjectsSection } from "#/ui/dashboard/section/ProjectsSection";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";

export type Section = "Dashboard" | "Projects" | "Invoices";

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
  const navigate = useNavigate();
  const logoutServerFnHandler = useServerFn(logoutServerFn);
  const session = Route.useRouteContext();
  const { tab } = Route.useSearch();

  async function handleLogout() {
    await logoutServerFnHandler();
  }

  const [currentSection, setCurrentSection] = useState<Section>(tab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleChangeSection(section: Section) {
    setCurrentSection(section);
    navigate({ to: "/dashboard/admin", search: { tab: section } });
  }

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
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

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
            Invoices Section
          </section>
        </div>
      </main>
    </div>
  );
}
