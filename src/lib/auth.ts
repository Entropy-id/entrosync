import { betterAuth } from "better-auth";
import { prisma } from "./db";

export const auth = betterAuth({
	database: prisma,
	emailAndPassword: {
		enabled: true,
	},
	user: {
		modelName: "User",
		fields: {
			name: "name",
			email: "email",
		},
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "FREELANCER",
				input: false,
			},
		},
	},
	session: {
		modelName: "Session",
		fields: {
			userId: "userId",
			expiresAt: "expiresAt",
			token: "token",
			createdAt: "createdAt",
			updatedAt: "updatedAt",
			ipAddress: "ipAddress",
			userAgent: "userAgent",
		},
	},
});

export type Session = typeof auth.$Infer.Session;
