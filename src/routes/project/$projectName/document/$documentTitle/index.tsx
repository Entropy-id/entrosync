import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getSessionWithOnboardingServerFn } from "#/modules/auth/auth.api";
import { getProjectByTitle } from "#/modules/project/project.api";
import { slugify } from "#/modules/project/project.mock";
import { ProjectDocumentPage } from "#/ui/project";

export const Route = createFileRoute(
  "/project/$projectName/document/$documentTitle/",
)({
  component: RouteComponent,
  beforeLoad: async () => {
    const result = await getSessionWithOnboardingServerFn();
    if (!result) {
      throw redirect({ to: "/login" });
    }
    const { session, onboardingCompleted } = result;
    if (!onboardingCompleted) {
      throw redirect({ to: "/onboarding" });
    }
    return session;
  },
  loader: async ({ params }) => {
    const project = await getProjectByTitle({
      data: { title: params.projectName },
    });
    if (!project) throw notFound();

    const document = project.documents.find(
      (d) => slugify(d.title) === params.documentTitle,
    );
    if (!document) throw notFound();

    return { project, document };
  },
});

function RouteComponent() {
  const { project, document } = Route.useLoaderData();
  const session = Route.useRouteContext();
  return (
    <ProjectDocumentPage
      project={project}
      document={document}
      user={session?.user}
    />
  );
}
