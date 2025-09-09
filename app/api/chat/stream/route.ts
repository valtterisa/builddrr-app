import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { generateAIResponseStream } from "@/app/actions";
import { rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, context: NextFetchEvent) {
  const { message, appName, repoExists = false, websiteId } = await req.json();

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

  // Soft per-minute rate limit to protect infra (separate from monthly plan limits)
  const success = await rateLimit(2, "1m", user.id);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Hard monthly chat limit by plan (server-side, atomic)
  const { data: enforce, error: enforceError } = await supabase.rpc(
    "enforce_chat_limit",
    { user_uuid: user.id, website_uuid: websiteId ?? null }
  );

  if (enforceError) {
    return NextResponse.json(
      { error: "Usage enforcement failed" },
      { status: 500 }
    );
  }

  const allowed = Array.isArray(enforce) ? enforce[0]?.allowed === true : false;
  const current = Array.isArray(enforce) ? (enforce[0]?.current_usage ?? 0) : 0;
  const limit = Array.isArray(enforce) ? (enforce[0]?.limit_value ?? 0) : 0;

  if (!allowed) {
    return NextResponse.json(
      {
        error: "AI usage limit reached for your plan",
        current,
        limit,
      },
      { status: 402 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        // Emit submitted status immediately
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "status", value: "submitted" })}\n\n`
          )
        );

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
