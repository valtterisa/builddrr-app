import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getProjectContext } from "@/lib/project-context";

export async function POST(req: NextRequest) {
  const { message, projectId } = await req.json();

  // Get the user's project context (files, structure, etc.)
  const projectContext = await getProjectContext(projectId);

  // Build a system prompt that includes instructions and context
  const systemPrompt = `
You are an expert AI coding assistant for a website builder. 
The user is working on the following project:
${projectContext}

When the user asks for changes, generate code in the correct format for this project. 
For every user request:
1. Explain in plain language the steps you will take.
2. Output the code or operations in the required format (e.g., <builddrr-write file="...">...</builddrr-write>).
`;

  // Call Claude via Vercel AI SDK
  const result = await streamText({
    system: systemPrompt,
    prompt: message,
    temperature: 0.2,
    model: anthropic("claude-3-7-sonnet-20250219"),
    maxTokens: 2000,
  });

  // Read the response (streaming or not)
  const reader = result.textStream.getReader();
  let aiResponse = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    aiResponse += value;
  }

  return NextResponse.json({ response: aiResponse });
}
