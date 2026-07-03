import { z } from "zod";

export const ProjectStatus = z.enum(["PENDING", "ON_PROGRESS", "DONE"]);
export const MilestoneStatus = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);
export const TaskStatus = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);

export const createProjectSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	clientId: z.string().uuid("Client ID must be a valid UUID"),
	freelancerId: z
		.string()
		.uuid("Freelancer ID must be a valid UUID")
		.optional(),
});

export const updateProjectSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	status: ProjectStatus.optional(),
	progress: z.string().optional(),
});

export const projectByIdSchema = z.object({
	id: z.string().uuid(),
});

export const createMilestoneSchema = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1, "Title is required"),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce.date().optional(),
});

export const updateMilestoneStatusSchema = z.object({
	id: z.string().uuid(),
	status: MilestoneStatus,
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

export const updateTaskStatusSchema = z.object({
	id: z.string().uuid(),
	status: TaskStatus,
});
