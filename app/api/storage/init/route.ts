import { NextResponse } from "next/server"
import { initializeStorage } from "@/lib/storage"

export async function GET() {
  try {
    await initializeStorage()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to initialize storage:", error)
    return NextResponse.json({ error: "Failed to initialize storage" }, { status: 500 })
  }
}

