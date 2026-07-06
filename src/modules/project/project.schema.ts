import { z } from "zod";

export const ProjectStatus = z.enum(["NOT_STARTED", "ON_PROGRESS", "DONE"]);
export const MilestoneStatus = z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]);
export const TaskStatus = z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]);

export const createProjectSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	clientId: z.string().uuid("Client ID must be a valid UUID").optional(),
});

export const updateProjectSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	status: ProjectStatus.optional(),
	progress: z.string().optional(),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
});

export const projectByIdSchema = z.object({
	id: z.string().uuid(),
});

export const createMilestoneSchema = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
});

export const updateMilestoneStatusSchema = z.object({
	id: z.string().uuid(),
	status: MilestoneStatus,
});

export const deleteMilestoneSchema = z.object({
	id: z.string().uuid(),
});

export const updateMilestoneSchema = z.object({
	id: z.string().uuid(),
	projectId: z.string().uuid(),
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
	status: MilestoneStatus.optional(),
});

export const milestoneByProjectSchema = z.object({
	projectId: z.string().uuid(),
});

export const createTaskSchema = z.object({
	milestoneId: z.string().uuid(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	status: TaskStatus.optional(),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
});

export const deleteTaskSchema = z.object({
	id: z.string().uuid(),
});

export const updateTaskStatusSchema = z.object({
	id: z.string().uuid(),
	status: TaskStatus,
});

export const projectByTitleSchema = z.object({
	title: z.string().min(1),
});

export const createProjectWithPrdSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	content: z.string().min(1, "PRD content is required"),
	clientId: z.string().uuid().optional(),
});

export const updateProjectDocumentSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).optional(),
	content: z.string().optional(),
});

export const deleteProjectDocumentSchema = z.object({
	id: z.string().uuid(),
});
