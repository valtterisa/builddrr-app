"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PuckDocument = unknown;

export async function getOrCreateUserWebsite(): Promise<{
  id: string;
  content: PuckDocument | null;
} | null> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;

    // Use preview_environments to store draft content
    const { data: existing, error: selectError } = await supabase
      .from("preview_environments")
      .select("preview_id, content, id")
      .eq("id", userId)
      .order("assigned_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      return {
        id: (existing as any).preview_id as string,
        content: (existing as any).content as PuckDocument | null,
      };
    }

    const { data: created, error: insertError } = await supabase
      .from("preview_environments")
      .insert([
        {
          id: userId,
          assigned_at: new Date().toISOString(),
          content: null,
        },
      ])
      .select("preview_id, content")
      .single();

    if (insertError) throw insertError;
    return {
      id: (created as any).preview_id as string,
      content: (created as any).content as PuckDocument | null,
    };
  } catch (error) {
    console.error("getOrCreateUserWebsite error", error);
    return null;
  }
}

export async function saveWebsiteContent(
  previewId: string,
  content: PuckDocument
): Promise<{ ok: boolean }> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { ok: false };

    // Ensure the preview belongs to the user
    const { data: preview, error: previewErr } = await supabase
      .from("preview_environments")
      .select("preview_id, id")
      .eq("preview_id", previewId)
      .single();
    if (previewErr || !preview || (preview as any).id !== userId)
      return { ok: false };

    const { error } = await supabase
      .from("preview_environments")
      .update({ content })
      .eq("preview_id", previewId);

    if (error) throw error;
    revalidatePath("/edit");
    return { ok: true };
  } catch (error) {
    console.error("saveWebsiteContent error", error);
    return { ok: false };
  }
}
