import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { DashboardSection } from "#/ui/dashboard/section/DashboardSection";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
export type Section = "Dashboard" | "Projects" | "Invoices";
export const Route = createFileRoute("/dashboard/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentSection, setCurrentSection] = useState<Section>("Dashboard");
  return (
    <div className="min-h-screen w-full flex font-inter">
      {/*Sidebar*/}
      <Sidebar
        currentSection={currentSection}
        onChangeSection={setCurrentSection}
      />

      {/*Main*/}
      <main className="flex-1 ">
        {/*Top Bar*/}
        <Topbar />

        {/*Content*/}
        <div className="max-w-6xl px-8 py-6">
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
