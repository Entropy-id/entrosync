import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProjectByInviteToken } from "#/modules/project/project.api";
import { ClientLayout } from "#/ui/client/ClientLayout";
import { ClientInvoicesPage } from "#/ui/client/ClientInvoicesPage";

export const Route = createFileRoute("/client/$token/invoices")({
  component: RouteComponent,
  loader: async ({ params }) => {
    try {
      const project = await getProjectByInviteToken({
        data: { token: params.token },
      });
      if (!project) throw notFound();
      return { project };
    } catch {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { project } = Route.useLoaderData();
  const { token } = Route.useParams();
  return (
    <ClientLayout project={project} token={token} activeTab="invoices">
      <ClientInvoicesPage project={project} />
    </ClientLayout>
  );
}
