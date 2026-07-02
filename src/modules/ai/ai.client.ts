const SYSTEM_PROMPT = `
You are an expert project manager and technical writer.
Your task is to analyze raw client conversations (chat logs, notes, rough briefs)
and transform them into a professional, structured Product Requirements Document (PRD).

Analyze the input carefully and generate a comperhensive PRD with the following sections:

# Project Requirements

## 1. Overview
A concise summary of what the project is about.

## 2. Requirements
- **Functional Requirements:** Key features and functionalities
- **Non-Functional Requirements:** Performance, security, scalability needs.

## 3. Scope of work
Recommended phases/milestones with clear deliverables and deadlines.

Use professional language. Be specific and actionable. Use markdown formatting for readability.
`;

export async function* streamPrd(
  apiKey: string,
  messages: Array<{ role: "user" | "system" | "assistant"; content: string }>,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          typeof window !== "undefined" ? window.location.href : "",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],
      }),
    },
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim() || !line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Ignore invalid JSON
      }
    }
  }
}
