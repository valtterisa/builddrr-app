import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { generateAIResponseStream } from "@/app/actions";
import { rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { trackAICall } from "@/lib/actions/ai-usage";

export async function POST(req: NextRequest, context: NextFetchEvent) {
  const { message, appName, repoExists = false } = await req.json();

  if (!message || !appName) {
    return NextResponse.json(
      { error: "Missing required parameters: message, appName" },
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
        // Track AI call usage
        await trackAICall();

        // Emit submitted status immediately
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", value: "submitted" })}\n\n`
          )
        );

        // Emit streaming status before starting chunks
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", value: "streaming" })}\n\n`
          )
        );

        for await (const chunk of generateAIResponseStream(
          message,
          appName,
          repoExists
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );
        }

        // Emit ready status before closing
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", value: "ready" })}\n\n`
          )
        );

        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        // Emit error status as well
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", value: "error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
