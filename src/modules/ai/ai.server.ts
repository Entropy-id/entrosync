import { createServerFn } from "@tanstack/react-start";
import { streamPrd } from "./ai.client";
import "dotenv/config";
export const streamPrdServer = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { messages } = data as unknown as {
    messages: Array<{ role: "user" | "system" | "assistant"; content: string }>;
  };
  const stream = streamPrd(process.env["OPENROUTER_KEY"] ?? "", messages);

  // Collect chuncks into a string and return
  let result = "";
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
});
