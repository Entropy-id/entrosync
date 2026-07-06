import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "#/modules/auth/auth.utils";
import { sendInviteEmail } from "#/modules/email/email.service";
import { prisma } from "#/utils/prisma";
import { slugify } from "./project.mock";
import {
  createMilestoneSchema,
  createProjectInviteSchema,
  createProjectSchema,
  createProjectWithPrdSchema,
  createTaskSchema,
  deleteMilestoneSchema,
  deleteProjectDocumentSchema,
  deleteTaskSchema,
  getProjectByInviteTokenSchema,
  milestoneByProjectSchema,
  projectByIdSchema,
  projectByTitleSchema,
  revokeInviteSchema,
  updateMilestoneSchema,
  updateMilestoneStatusSchema,
  updateProjectDocumentSchema,
  updateProjectSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./project.schema";
import {
  serializeDocument,
  serializeMilestone,
  serializeProjectDetail,
  serializeProjectForClient,
  serializeProjectWithMilestones,
  serializeTask,
} from "./project.utils";

/**
 * Fetches all projects with their milestones and tasks.
 *
 * @remarks
 * Server function — runs only on the server.
 * Results are ordered by `createdAt`: projects descending, milestones ascending.
 * Returns serialized data; dates are converted to strings.
 *
 * @returns A list of serialized projects with nested milestones and tasks.
 */
export const getProjects = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  const projects = await prisma.project.findMany({
    where: { freelancerId: session.user.id },
    include: {
      client: { select: { name: true } },
      milestones: {
        include: { tasks: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return projects.map(serializeProjectWithMilestones);
});

/**
 * Fetches project details by ID, including its milestones and tasks.
 *
 * @remarks
 * Server function — runs only on the server.
 * Returns serialized data; dates are converted to strings.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const getProjectById = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");

  const { id } = projectByIdSchema.parse(data);
  const project = await prisma.project.findUnique({
    where: { id, freelancerId: session.user.id },
    include: {
      milestones: {
        include: { tasks: true },
        orderBy: { createdAt: "asc" },
      },
      invoices: { orderBy: { issuedDate: "desc" } },
      feedbacks: { orderBy: { createdAt: "desc" } },
      resources: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });
  return serializeProjectDetail(project);
});

/**
 * Fetches a project by its title, including its milestones and tasks.
 *
 * @remarks
 * Server function — runs only on the server.
 * Returns serialized data; dates are converted to strings.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const getProjectByTitle = createServerFn({
  method: "GET",
})
  .validator((input) => projectByTitleSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const { title } = data;
    const projects = await prisma.project.findMany({
      where: { freelancerId: session.user.id },
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { createdAt: "asc" },
        },
        invoices: { orderBy: { issuedDate: "desc" } },
        feedbacks: { orderBy: { createdAt: "desc" } },
        resources: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        logs: { orderBy: { createdAt: "desc" } },
      },
    });
    const project = projects.find((p) => slugify(p.title) === title);
    return serializeProjectDetail(project || null);
  });

/**
 * Creates a new project.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const createProject = createServerFn({
  method: "POST",
})
  .validator((input) => createProjectSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = createProjectSchema.parse(data);
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const project = await prisma.project.create({
      data: {
        ...parsed,
        freelancerId: session.user.id,
      },
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return serializeProjectWithMilestones(project);
  });

/**
 * Updates an existing project.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const updateProject = createServerFn({
  method: "POST",
})
  .validator((input) => updateProjectSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, ...rest } = updateProjectSchema.parse(data);
    const project = await prisma.project.update({
      where: { id },
      data: rest,
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return serializeProjectWithMilestones(project);
  });

/**
 * Creates a new project with a PRD (Product Requirements Document).
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const createProjectWithPrd = createServerFn({
  method: "POST",
})
  .validator((input) => createProjectWithPrdSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = data;
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const project = await prisma.project.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        freelancerId: session.user.id,
        clientId: parsed.clientId,
      },
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    await prisma.projectDocument.create({
      data: {
        projectId: project.id,
        title: `${parsed.title} - PRD`,
        content: parsed.content,
        version: 1,
      },
    });
    return serializeProjectWithMilestones(project);
  });

/**
 * Deletes a project by its ID.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const deleteProject = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { id } = projectByIdSchema.parse(data);
  const project = await prisma.project.delete({
    where: { id },
    include: {
      milestones: {
        include: { tasks: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return serializeProjectWithMilestones(project);
});

/**
 * Fetches milestones by project ID.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized project details with nested milestones and tasks.
 */
export const getMilestonesByProjectId = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const { projectId } = milestoneByProjectSchema.parse(data);
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return milestones.map(serializeMilestone);
});

/**
 * Creates a new milestone.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized milestone details.
 */
export const createMilestone = createServerFn({
  method: "POST",
})
  .validator((input) => createMilestoneSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = createMilestoneSchema.parse(data);
    const milestone = await prisma.milestone.create({
      data: parsed,
      include: { tasks: true },
    });
    return serializeMilestone(milestone);
  });

/**
 * Updates the status of a milestone.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized milestone details.
 */
export const updateMilestoneStatus = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { id, status } = updateMilestoneStatusSchema.parse(data);
  const milestone = await prisma.milestone.update({
    where: { id },
    data: { status },
    include: { tasks: true },
  });
  return serializeMilestone(milestone);
});

export const updateMilestone = createServerFn({
  method: "POST",
})
  .validator((input) => updateMilestoneSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const milestone = await prisma.milestone.update({
      where: { id },
      data: rest,
      include: { tasks: true },
    });
    return serializeMilestone(milestone);
  });

/**
 * Deletes a milestone.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized milestone details.
 */
export const deleteMilestone = createServerFn({
  method: "POST",
})
  .validator((input) => deleteMilestoneSchema.parse(input))
  .handler(async ({ data }) => {
    const { id } = data;
    await prisma.milestone.delete({ where: { id } });
    return null;
  });

/**
 * Creates a new task.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized task details.
 */
export const createTask = createServerFn({
  method: "POST",
})
  .validator((input) => createTaskSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = createTaskSchema.parse(data);
    const task = await prisma.task.create({ data: parsed });
    return serializeTask(task);
  });

/**
 * Updates the status of a task.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized task details.
 */
export const updateTaskStatus = createServerFn({
  method: "POST",
})
  .validator((input) => updateTaskStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, status } = updateTaskStatusSchema.parse(data);
    const task = await prisma.task.update({ where: { id }, data: { status } });
    return serializeTask(task);
  });

/**
 * Updates a task.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized task details.
 */
export const updateTask = createServerFn({
  method: "POST",
})
  .validator((input) => updateTaskSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, ...rest } = updateTaskSchema.parse(data);
    const task = await prisma.task.update({ where: { id }, data: rest });
    return serializeTask(task);
  });

/**
 * Deletes a task by ID.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns null
 */
export const deleteTask = createServerFn({
  method: "POST",
})
  .validator((input) => deleteTaskSchema.parse(input))
  .handler(async ({ data }) => {
    const { id } = deleteTaskSchema.parse(data);
    await prisma.task.delete({ where: { id } });
    return null;
  });

/**
 * Fetches a project document by ID.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized document details.
 */
export const getProjectDocument = createServerFn({
  method: "GET",
})
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { id } = data;
    const document = await prisma.projectDocument.findUnique({
      where: { id },
    });
    if (!document) return null;
    return serializeDocument(document);
  });

/**
 * Updates a project document.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns The serialized document details.
 */
export const updateProjectDocument = createServerFn({
  method: "POST",
})
  .validator((input) => updateProjectDocumentSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, ...rest } = updateProjectDocumentSchema.parse(data);
    const document = await prisma.projectDocument.update({
      where: { id },
      data: rest,
    });
    return serializeDocument(document);
  });

/**
 * Deletes a project document by ID.
 *
 * @remarks
 * Server function — runs only on the server.
 *
 * @returns null
 */
export const deleteProjectDocument = createServerFn({
  method: "POST",
})
  .validator((input) => deleteProjectDocumentSchema.parse(input))
  .handler(async ({ data }) => {
    const { id } = deleteProjectDocumentSchema.parse(data);
    await prisma.projectDocument.delete({ where: { id } });
    return null;
  });

/**
 * Creates a shareable invite token for a client to view a project.
 *
 * @remarks
 * Server function — runs only on the server.
 * Requires freelancer auth and project ownership.
 *
 * @returns The invite URL and token.
 */
export const createProjectInvite = createServerFn({
  method: "POST",
})
  .validator((input) => createProjectInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const parsed = createProjectInviteSchema.parse(data);
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const project = await prisma.project.findFirst({
      where: { id: parsed.projectId, freelancerId: session.user.id },
      include: { freelancer: { select: { name: true } } },
    });
    if (!project) throw new Error("Project not found");

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const invite = await prisma.projectInvite.create({
      data: {
        token,
        projectId: parsed.projectId,
        email: parsed.email,
        expiresAt,
      },
    });

    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/client/${token}`;

    if (parsed.email) {
      await sendInviteEmail({
        to: parsed.email,
        clientName: parsed.email.split("@")[0],
        freelancerName: project.freelancer.name ?? "Your freelancer",
        projectTitle: project.title,
        inviteUrl: url,
      }).catch((err) => {
        console.error("Failed to send invite email:", err);
      });
    }

    return { inviteId: invite.id, token, url };
  });

/**
 * Fetches a project by invite token (public, no auth required).
 *
 * @remarks
 * Server function — runs only on the server.
 * Validates token expiry.
 *
 * @returns Serialized project detail.
 */
export const getProjectInvites = createServerFn({
  method: "GET",
})
  .validator((input) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: data.projectId,
        project: { freelancerId: session.user.id },
      },
      orderBy: { createdAt: "desc" },
    });

    return invites.map((i) => ({
      id: i.id,
      email: i.email,
      token: i.token,
      expiresAt: i.expiresAt.toISOString(),
      createdAt: i.createdAt.toISOString(),
      isExpired: i.expiresAt < new Date(),
    }));
  });

export const revokeProjectInvite = createServerFn({
  method: "POST",
})
  .validator((input) => revokeInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");

    const invite = await prisma.projectInvite.findFirst({
      where: {
        id: data.inviteId,
        project: { freelancerId: session.user.id },
      },
    });
    if (!invite) throw new Error("Invite not found");

    await prisma.projectInvite.delete({ where: { id: data.inviteId } });
    return { success: true };
  });

export const getProjectByInviteToken = createServerFn({
  method: "GET",
})
  .validator((input) => getProjectByInviteTokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { token } = getProjectByInviteTokenSchema.parse(data);

    const invite = await prisma.projectInvite.findUnique({
      where: { token },
    });
    if (!invite) throw new Error("Invalid invite token");
    if (invite.expiresAt < new Date()) throw new Error("Invite expired");

    // Track first access
    if (!invite.accessedAt) {
      await prisma.projectInvite.update({
        where: { id: invite.id },
        data: { accessedAt: new Date() },
      });
    }

    // Log the view
    await prisma.projectLog.create({
      data: {
        projectId: invite.projectId,
        action: "CLIENT_DASHBOARD_VIEWED",
        description: `Client viewed dashboard via invite token`,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: invite.projectId },
      include: {
        freelancer: { select: { name: true, email: true } },
        milestones: {
          include: { tasks: true },
          orderBy: { createdAt: "asc" },
        },
        invoices: { orderBy: { issuedDate: "desc" } },
        feedbacks: { orderBy: { createdAt: "desc" } },
        resources: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        logs: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) throw new Error("Project not found");

    return serializeProjectForClient(project);
  });
