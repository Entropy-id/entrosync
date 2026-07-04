import type { Prisma } from "#/generated/prisma/client";
import { toISOString } from "#/lib/serialize";

// Serialize Task
export function serializeTask(task: Prisma.TaskGetPayload<true>) {
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

// Serialize Project With Milestone
// To serialize a project with milestones to be able to display it in the UI
export type MilestoneWithTasks = Prisma.MilestoneGetPayload<{
  include: { tasks: true };
}>;
export function serializeMilestone(milestone: MilestoneWithTasks) {
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

// Serialize Project data with milestones
// To serialize a project with milestones to be able to display it in the UI
type ProjectWithMilestones = Prisma.ProjectGetPayload<{
  include: {
    milestones: {
      include: { tasks: true };
    };
  };
}>;
export function serializeProjectWithMilestones(project: ProjectWithMilestones) {
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

// Serialize Invoice
// To serialize an invoice to be able to display it in the UI
export function serializeInvoice(invoice: Prisma.InvoiceGetPayload<true>) {
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

// Serialize Feedback
// To serialize a feedback to be able to display it in the UI
export function serializeFeedback(feedback: Prisma.FeedbackGetPayload<true>) {
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

// Serialize Resource
// To serialize a resource to be able to display it in the UI
export function serializeResource(resource: Prisma.ResourceGetPayload<true>) {
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

// Serialize Document
// To serialize a document to be able to display it in the UI
export function serializeDocument(
  document: Prisma.ProjectDocumentGetPayload<true>,
) {
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

// Serialize Log
// To serialize a log to be able to display it in the UI
export function serializeLog(log: Prisma.ProjectLogGetPayload<true>) {
  return {
    id: log.id,
    projectId: log.projectId,
    action: log.action,
    description: log.description,
    createdAt: toISOString(log.createdAt),
  };
}

// Serialize Project Detail
// To serialize project detail to be able to display it in the UI
export type ProjectDetail = Prisma.ProjectGetPayload<{
  include: {
    milestones: { include: { tasks: true } };
    invoices: true;
    feedbacks: true;
    resources: true;
    documents: true;
    logs: true;
  };
}>;
export function serializeProjectDetail(project: ProjectDetail | null) {
  if (!project) return null;
  return {
    id: project.id,
    freelancerId: project.freelancerId,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    progress: project.progress,
    status: project.status,
    startDate: toISOString(project.startDate),
    dueDate: toISOString(project.dueDate),
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
