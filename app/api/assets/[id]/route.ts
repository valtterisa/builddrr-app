import { type NextRequest, NextResponse } from "next/server"
import { getAsset } from "@/lib/database"
import { StorageBucket } from "@/lib/storage"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the asset from the database
    const asset = await getAsset(params.id)

    // Get the file from storage
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.from(StorageBucket.WEBSITE_ASSETS).download(asset.path)

    if (error) {
      throw error
    }

    // Return the file with appropriate content type
    return new NextResponse(data, {
      headers: {
        "Content-Type": asset.type,
        "Content-Disposition": `inline; filename="${asset.name}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving asset:", error)
    return NextResponse.json({ error: "Failed to serve asset" }, { status: 500 })
  }
}

