// lib/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function summarizeTodos(todos: any[]): Promise<string> {
  // Format todos for summarization
  const todoText = todos
    .map((todo) => `- ${todo.title}: ${todo.description || "No description"}`)
    .join("\n");

  // Generate summary using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gemini-2.0-flash-exp",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that summarizes todo items in a concise and actionable way.",
      },
      {
        role: "user",
        content: `Please summarize these todo items:\n${todoText}`,
      },
    ],
    max_tokens: 500,
  });

  return completion.choices[0].message.content || "";
}
