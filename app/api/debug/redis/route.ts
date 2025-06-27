import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const appName = searchParams.get('appName');

        if (!userId || !appName) {
            return NextResponse.json({
                error: "Missing userId or appName parameters"
            }, { status: 400 });
        }

        const chatKey = `chat:${userId}:${appName}`;

        // Get all messages for this chat
        const messages = await redis.lrange(chatKey, 0, -1);

        // Parse and format the messages
        const parsedMessages = messages.map((msg, index) => {
            try {
                const parsed = JSON.parse(msg.toString());
                return {
                    index,
                    id: parsed.id,
                    content: parsed.content,
                    isUser: parsed.isUser,
                    timestamp: parsed.timestamp,
                    raw: msg.toString()
                };
            } catch (error) {
                return {
                    index,
                    error: "Failed to parse message",
                    raw: msg.toString()
                };
            }
        });

        return NextResponse.json({
            chatKey,
            totalMessages: messages.length,
            messages: parsedMessages
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
} 