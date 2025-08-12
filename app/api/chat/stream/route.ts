import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { generateAIResponseStream } from "@/app/actions";
import { rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, context: NextFetchEvent) {
  const { message, appName, machineId } = await req.json();

  if (!message || !appName || !machineId) {
    return NextResponse.json(
      { error: "Missing required parameters: message, appName, machineId" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await rateLimit(2, "1m", user.id);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of generateAIResponseStream(
          message,
          appName,
          machineId
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );
        }
        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
