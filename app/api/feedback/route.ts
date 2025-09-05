import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

const feedbackSchema = z.object({
    content: z.string().min(1, "Feedback content is required").max(5000, "Feedback content is too long"),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }


        // Ratelimit
        const success = await rateLimit(1, "1m", user.id);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        // Parse and validate the request body
        const body = await request.json();
        const { content } = feedbackSchema.parse(body);

        // Insert feedback into the database
        const { data, error } = await supabase
            .from("feedback")
            .insert({
                user_id: user.id,
                content,
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            console.error("Error inserting feedback:", error);
            return NextResponse.json(
                { error: "Failed to save feedback" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            feedback: data,
        });
    } catch (error) {
        console.error("Error in feedback API:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
