import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/utils/prisma";
import {
  createMilestoneSchema,
  createProjectSchema,
  createProjectWithPrdSchema,
  createTaskSchema,
  milestoneByProjectSchema,
  projectByIdSchema,
  projectByTitleSchema,
  updateMilestoneSchema,
  updateMilestoneStatusSchema,
  updateProjectSchema,
  updateTaskStatusSchema,
} from "./project.schema";
import { slugify } from "./project.mock";
import {
  serializeMilestone,
  serializeProjectDetail,
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
  const projects = await prisma.project.findMany({
    include: {
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
  const { id } = projectByIdSchema.parse(data);
  const project = await prisma.project.findUnique({
    where: { id },
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
    const { title } = data;
    const projects = await prisma.project.findMany({
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
    const project = await prisma.project.create({
      data: {
        ...parsed,
        freelancerId: parsed.freelancerId || "",
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
    const project = await prisma.project.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        freelancerId: parsed.freelancerId || "",
        clientId: parsed.clientId || "",
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
