import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage } from "@/app/actions";

// POST /api/chat/save-message
export async function POST(req: NextRequest) {
    try {
        const { userId, appName, message, isUser } = await req.json();
        if (!userId || !appName || !message) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }
        const result = await sendChatMessage(userId, appName, message, isUser ?? false);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
} 