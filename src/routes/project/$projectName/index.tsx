import { getSessionServerFn } from "#/modules/auth/auth.api";
import { getProjectByTitle } from "#/modules/project/project.api";
import { ProjectDetailPage } from "#/ui/project";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/project/$projectName/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSessionServerFn();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return session;
  },
  loader: async ({ params }) => {
    const project = await getProjectByTitle({
      data: { title: params.projectName },
    });
    if (!project) throw notFound();
    return { project };
  },
});

function RouteComponent() {
  const { project } = Route.useLoaderData();
  return <ProjectDetailPage project={project} />;
}
