import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/db";
import { toISOString } from "#/lib/serialize";
import {
  createMilestoneSchema,
  createProjectSchema,
  createProjectWithPrdSchema,
  createTaskSchema,
  milestoneByProjectSchema,
  projectByIdSchema,
  updateMilestoneStatusSchema,
  updateProjectSchema,
  updateTaskStatusSchema,
} from "./project.schema";

// TODO: replace with actual authenticated IDs once auth is implemented
const HARDCODED_FREELANCER_ID = "2d61d86c-ffaf-4d3b-94ab-31e0939707ca";
const HARDCODED_CLIENT_ID = "d36ebfd8-9049-4890-8b14-484da8a52ea2";

type ProjectWithMilestones = Prisma.ProjectGetPayload<{
  include: {
    milestones: {
      include: { tasks: true };
    };
  };
}>;

type ProjectDetail = Prisma.ProjectGetPayload<{
  include: {
    milestones: { include: { tasks: true } };
    invoices: true;
    feedbacks: true;
    resources: true;
    documents: true;
    logs: true;
  };
}>;

type MilestoneWithTasks = Prisma.MilestoneGetPayload<{
  include: { tasks: true };
}>;

function serializeTask(task: Prisma.TaskGetPayload<true>) {
  return {
    id: task.id,
    milestoneId: task.milestoneId,
    title: task.title,
    description: task.description,
    status: task.status,
    startDate: toISOString(task.startDate),
    dueDate: toISOString(task.dueDate),
    createdAt: toISOString(task.createdAt),
    updatedAt: toISOString(task.updatedAt),
  };
}

function serializeMilestone(milestone: MilestoneWithTasks) {
  return {
    id: milestone.id,
    projectId: milestone.projectId,
    title: milestone.title,
    status: milestone.status,
    startDate: toISOString(milestone.startDate),
    dueDate: toISOString(milestone.dueDate),
    createdAt: toISOString(milestone.createdAt),
    updatedAt: toISOString(milestone.updatedAt),
    tasks: milestone.tasks.map(serializeTask),
  };
}

function serializeProjectWithMilestones(project: ProjectWithMilestones) {
  return {
    id: project.id,
    freelancerId: project.freelancerId,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    progress: project.progress,
    status: project.status,
    createdAt: toISOString(project.createdAt),
    updatedAt: toISOString(project.updatedAt),
    milestones: project.milestones.map(serializeMilestone),
  };
}

function serializeInvoice(invoice: Prisma.InvoiceGetPayload<true>) {
  return {
    id: invoice.id,
    projectId: invoice.projectId,
    amount: invoice.amount.toNumber(),
    status: invoice.status,
    paymentLink: invoice.paymentLink,
    issuedDate: toISOString(invoice.issuedDate),
    createdAt: toISOString(invoice.createdAt),
    updatedAt: toISOString(invoice.updatedAt),
  };
}

function serializeFeedback(feedback: Prisma.FeedbackGetPayload<true>) {
  return {
    id: feedback.id,
    projectId: feedback.projectId,
    title: feedback.title,
    description: feedback.description,
    rating: feedback.rating,
    createdAt: toISOString(feedback.createdAt),
    updatedAt: toISOString(feedback.updatedAt),
  };
}

function serializeResource(resource: Prisma.ResourceGetPayload<true>) {
  return {
    id: resource.id,
    projectId: resource.projectId,
    title: resource.title,
    type: resource.type,
    url: resource.url,
    createdAt: toISOString(resource.createdAt),
    updatedAt: toISOString(resource.updatedAt),
  };
}

function serializeDocument(document: Prisma.ProjectDocumentGetPayload<true>) {
  return {
    id: document.id,
    projectId: document.projectId,
    title: document.title,
    content: document.content,
    version: document.version,
    createdAt: toISOString(document.createdAt),
    updatedAt: toISOString(document.updatedAt),
  };
}

function serializeLog(log: Prisma.ProjectLogGetPayload<true>) {
  return {
    id: log.id,
    projectId: log.projectId,
    action: log.action,
    description: log.description,
    createdAt: toISOString(log.createdAt),
  };
}

function serializeProjectDetail(project: ProjectDetail | null) {
  if (!project) return null;
  return {
    id: project.id,
    freelancerId: project.freelancerId,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    progress: project.progress,
    status: project.status,
    createdAt: toISOString(project.createdAt),
    updatedAt: toISOString(project.updatedAt),
    milestones: project.milestones.map(serializeMilestone),
    invoices: project.invoices.map(serializeInvoice),
    feedbacks: project.feedbacks.map(serializeFeedback),
    resources: project.resources.map(serializeResource),
    documents: project.documents.map(serializeDocument),
    logs: project.logs.map(serializeLog),
  };
}

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

export const createProject = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = createProjectSchema.parse(data);
  const project = await prisma.project.create({
    data: {
      ...parsed,
      freelancerId: parsed.freelancerId || HARDCODED_FREELANCER_ID,
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

export const updateProject = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
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
        freelancerId: parsed.freelancerId || HARDCODED_FREELANCER_ID,
        clientId: parsed.clientId || HARDCODED_CLIENT_ID,
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

export const createMilestone = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = createMilestoneSchema.parse(data);
  const milestone = await prisma.milestone.create({
    data: parsed,
    include: { tasks: true },
  });
  return serializeMilestone(milestone);
});

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

export const createTask = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = createTaskSchema.parse(data);
  const task = await prisma.task.create({ data: parsed });
  return serializeTask(task);
});

export const updateTaskStatus = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { id, status } = updateTaskStatusSchema.parse(data);
  const task = await prisma.task.update({ where: { id }, data: { status } });
  return serializeTask(task);
});
