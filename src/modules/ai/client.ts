import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
	apiKey: "YOUR_OPENROUTER_API_KEY",
});

export async function createPrd(
	messages: Array<{ role: "user" | "system"; content: string }>,
) {
	return await client.chat.send({
		chatRequest: {
			model: "google/gemini-2.5-flash-lite",
			messages,
		},
	});
}
