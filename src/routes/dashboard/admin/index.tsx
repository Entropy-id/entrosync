import { ActiveProject } from "#/ui/dashboard/layouts/ActiveProject";
import { ActivityFeed } from "#/ui/dashboard/layouts/ActivityFeed";
import { PayoutSchedule } from "#/ui/dashboard/layouts/PayoutSchedule";
import { Sidebar } from "#/ui/dashboard/layouts/Sidebar";
import { Status } from "#/ui/dashboard/layouts/Status";
import { Topbar } from "#/ui/dashboard/layouts/Topbar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full flex font-inter">
      {/*Sidebar*/}
      <Sidebar />

      {/*Main*/}
      <main className="flex-1 ">
        {/*Top Bar*/}
        <Topbar />

        {/*Content*/}
        <div className="max-w-6xl px-8 py-6">
          {/*Status*/}
          <Status />

          {/* Active Projects */}
          <ActiveProject />

          {/* Payout Schedule */}
          <PayoutSchedule />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </main>
    </div>
  );
}
