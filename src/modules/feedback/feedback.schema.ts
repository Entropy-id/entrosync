import { z } from "zod";

export const Rating = z.enum(["ONE", "TWO", "THREE", "FOUR", "FIVE"]);

export const createFeedbackSchema = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	rating: Rating,
});

export const feedbackByProjectSchema = z.object({
	projectId: z.string().uuid(),
});
