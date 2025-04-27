import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/supabase";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();

    // Validate required fields
    if (!name || !email || !company || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get user session if available
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase!.auth.getSession();

    // In a real implementation, you would:
    // 1. Store this information in your database
    // 2. Send an email notification to your sales team
    // 3. Maybe create a task in your CRM

    // For now, we'll just log it and return success
    console.log("Contact sales request:", {
      name,
      email,
      company,
      message,
      userId: session?.user?.id || "anonymous",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing contact sales request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
