import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProjectByInviteToken } from "#/modules/project/project.api";
import { ClientDashboardPage } from "#/ui/client/ClientDashboardPage";

export const Route = createFileRoute("/client/$token/")({
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
	return <ClientDashboardPage project={project} />;
}
