import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "#/generated/prisma/client";
import { toISOString } from "#/lib/serialize";
import { prisma } from "#/utils/prisma";
import {
	createFeedbackSchema,
	feedbackByProjectSchema,
} from "./feedback.schema";

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

export const getFeedbacksByProjectId = createServerFn({
	method: "GET",
}).handler(async ({ data }) => {
	const { projectId } = feedbackByProjectSchema.parse(data);
	const feedbacks = await prisma.feedback.findMany({
		where: { projectId },
		orderBy: { createdAt: "desc" },
	});
	return feedbacks.map(serializeFeedback);
});

export const createFeedback = createServerFn({
	method: "POST",
}).handler(async ({ data }) => {
	const parsed = createFeedbackSchema.parse(data);
	const feedback = await prisma.feedback.create({ data: parsed });
	return serializeFeedback(feedback);
});
