import { NextRequest, NextResponse } from "next/server";
import {
  getSandboxStatus,
  deploySandboxAndStopExisting,
} from "@/lib/vercel/vercel";
import { createClient } from "@/lib/supabase/server";

const MIN_RECREATE_INTERVAL_MS = 15_000; // backoff to avoid provider rate limits
const WAIT_TIMEOUT_MS = 60_000; // how long server waits for sandbox to be running
const WAIT_INTERVAL_MS = 2_000;

async function waitUntilRunning(
  sandboxId: string,
  timeoutMs: number = WAIT_TIMEOUT_MS,
  intervalMs: number = WAIT_INTERVAL_MS
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await getSandboxStatus(sandboxId);
    if (result.success && result.status === "running" && result.url) {
      return { success: true as const, url: result.url };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { success: false as const };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.info("sandbox-status: unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: appName, recreate } = await request.json();
    if (!appName) {
      console.info("sandbox-status: missing appName in body");
      return NextResponse.json(
        { error: "Missing app id (appName)" },
        { status: 400 }
      );
    }

    // Ensure ownership
    const { data: website } = await supabase
      .from("websites")
      .select("id")
      .eq("app_name", appName)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!website) {
      console.info("sandbox-status: forbidden app", {
        appName,
        userId: user.id,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch existing preview row, create if missing
    let { data: preview, error: previewError } = await supabase
      .from("preview_environments")
      .select("sandbox_id, updated_at")
      .eq("app_name", appName)
      .maybeSingle();

    console.info("sandbox-status: preview query result", {
      appName,
      hasPreview: !!preview,
      previewError: previewError?.message,
      rawSandboxId: preview?.sandbox_id,
    });

    // If preview row doesn't exist, create it
    if (!preview) {
      console.info("sandbox-status: creating missing preview row", { appName });
      const { data: newPreview } = await supabase
        .from("preview_environments")
        .insert({
          app_name: appName,
          id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .select("sandbox_id, updated_at")
        .single();
      preview = newPreview;
    }

    let sandboxId = preview?.sandbox_id as string | null | undefined;
    // Treat null, undefined, or empty string as no sandbox
    if (!sandboxId || sandboxId.trim() === "") {
      sandboxId = undefined;
    }

    let lastUpdatedAt = preview?.updated_at
      ? new Date(preview.updated_at).getTime()
      : 0;

    console.info("sandbox-status: initial state", {
      appName,
      sandboxId: sandboxId ? `${sandboxId.substring(0, 8)}...` : "none",
      hasPreview: !!preview,
      lastUpdatedAt: lastUpdatedAt || "never",
    });

    const now = Date.now();

    // If recreate requested (user made changes), throttle attempts but force a (re)create path
    if (recreate === true) {
      if (!lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS) {
        console.info("sandbox-status: recreate requested", { appName });
        // touch/update preview row to start cooldown (preserve existing sandbox_id)
        await supabase
          .from("preview_environments")
          .update({ sandbox_id: sandboxId })
          .eq("app_name", appName);
        try {
          const created = await deploySandboxAndStopExisting(appName, true);
          sandboxId = created.sandboxId;
          if (sandboxId) {
            const waited = await waitUntilRunning(sandboxId);
            if (waited.success) {
              console.info(
                "sandbox-status: recreate successful, updating database",
                {
                  appName,
                  newSandboxId: sandboxId?.substring(0, 8) + "...",
                }
              );

              // Update database with new sandbox ID
              const { error: updateError } = await supabase
                .from("preview_environments")
                .update({ sandbox_id: sandboxId })
                .eq("app_name", appName);

              if (updateError) {
                console.error(
                  "sandbox-status: database update failed",
                  updateError
                );
              }
              return NextResponse.json(
                {
                  success: true,
                  status: "running",
                  url: waited.url,
                  sandboxId,
                },
                { status: 200 }
              );
            }
          }
        } catch (e) {
          console.info("sandbox-status: recreate failed", {
            appName,
            error: (e as Error)?.message,
          });
          const status =
            (e as any)?.status ||
            (e as any)?.statusCode ||
            (e as any)?.response?.status ||
            500;
          const message = (e as Error)?.message || "recreate failed";
          return NextResponse.json({ error: message }, { status });
        }
      }
      return NextResponse.json({ error: "Not ready" }, { status: 404 });
    }

    // Row always exists by design; no placeholder creation here

    // If we have a sandboxId, check status (no cooldown for checking)
    if (sandboxId) {
      const result = await getSandboxStatus(sandboxId);

      console.info("sandbox-status: status check result", {
        appName,
        sandboxId: sandboxId.substring(0, 8) + "...",
        success: result.success,
        status: result.status,
        hasUrl: !!result.url,
        url: result.url,
        error: result.success ? null : result.error,
      });

      if (result.success && result.status === "running" && result.url) {
        console.info("sandbox-status: running", {
          appName,
          sandboxId,
          url: result.url,
        });
        return NextResponse.json(
          { success: true, status: "running", url: result.url, sandboxId },
          { status: 200 }
        );
      }
      // If pending, let client continue polling
      if (result.success && result.status === "pending") {
        return NextResponse.json({ error: "Not ready" }, { status: 404 });
      }
      // If "stopped" but has URL, test if it's actually accessible before recreating
      if (result.success && result.status === "stopped" && result.url) {
        console.info(
          "sandbox-status: testing if 'stopped' sandbox is actually accessible",
          {
            appName,
            url: result.url,
          }
        );

        try {
          const response = await fetch(result.url, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok || response.status < 400) {
            console.info(
              "sandbox-status: 'stopped' sandbox is actually running!",
              {
                appName,
                responseStatus: response.status,
              }
            );

            return NextResponse.json(
              { success: true, status: "running", url: result.url, sandboxId },
              { status: 200 }
            );
          }
        } catch (e) {
          console.info("sandbox-status: stopped sandbox is truly dead", {
            appName,
            error: (e as Error).message,
          });
        }
      }

      // If stopped/failed/not-found, recreate (stopped sandboxes auto-stop due to inactivity)
      if (
        (result.success &&
          (result.status === "stopped" || result.status === "failed")) ||
        !result.success
      ) {
        // For stopped sandboxes (auto-stopped due to inactivity), recreate immediately
        // Only apply cooldown for failed sandboxes to prevent spam
        const shouldRespectCooldown =
          result.status === "failed" || !result.success;
        if (
          !shouldRespectCooldown ||
          !lastUpdatedAt ||
          now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS
        ) {
          console.info(
            "sandbox-status: attempting to restart/recreate stopped sandbox",
            {
              appName,
              sandboxId,
              currentStatus: result.status,
            }
          );
          // Start cooldown timer (preserve existing sandbox_id)
          await supabase
            .from("preview_environments")
            .update({ sandbox_id: sandboxId })
            .eq("app_name", appName);
          try {
            // First try to reuse/restart existing (recreate=false), then force recreate if needed
            const created = await deploySandboxAndStopExisting(appName, false);
            if (created?.sandboxId) {
              console.info(
                "sandbox-status: got new sandbox, waiting for running",
                {
                  appName,
                  oldSandboxId: sandboxId?.substring(0, 8) + "...",
                  newSandboxId: created.sandboxId.substring(0, 8) + "...",
                }
              );

              const waited = await waitUntilRunning(created.sandboxId);
              if (waited.success) {
                console.info(
                  "sandbox-status: updating database with new sandbox",
                  {
                    appName,
                    newSandboxId: created.sandboxId.substring(0, 8) + "...",
                  }
                );

                // Only update database after successful creation and wait
                const { error: updateError } = await supabase
                  .from("preview_environments")
                  .update({ sandbox_id: created.sandboxId })
                  .eq("app_name", appName);

                if (updateError) {
                  console.error(
                    "sandbox-status: database update failed",
                    updateError
                  );
                }
                return NextResponse.json(
                  {
                    success: true,
                    status: "running",
                    url: waited.url,
                    sandboxId: created.sandboxId,
                  },
                  { status: 200 }
                );
              }
            }
          } catch (e) {
            const message = (e as Error)?.message || "recreate failed";
            console.info("sandbox-status: recreate failed", {
              appName,
              error: message,
            });
            const status =
              (e as any)?.status ||
              (e as any)?.statusCode ||
              (e as any)?.response?.status ||
              500;
            return NextResponse.json({ error: message }, { status });
          }
        }
        return NextResponse.json({ error: "Not ready" }, { status: 404 });
      }
      // All other statuses (stopping, unknown, etc.) - wait and retry
      return NextResponse.json({ error: "Not ready" }, { status: 404 });
    }

    // Have row but no sandboxId yet: honor cooldown before creating
    if (
      !sandboxId &&
      (!lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS)
    ) {
      console.info("sandbox-status: no sandboxId yet, attempting create", {
        appName,
        lastUpdatedAt,
        cooldownPassed:
          !lastUpdatedAt || now - lastUpdatedAt >= MIN_RECREATE_INTERVAL_MS,
        timeSinceUpdate: lastUpdatedAt ? now - lastUpdatedAt : "never",
      });
      try {
        const created = await deploySandboxAndStopExisting(appName, false);
        if (created?.sandboxId) {
          const waited = await waitUntilRunning(created.sandboxId);
          if (waited.success) {
            // Update database with new sandbox ID
            await supabase
              .from("preview_environments")
              .update({ sandbox_id: created.sandboxId })
              .eq("app_name", appName);
            return NextResponse.json(
              {
                success: true,
                status: "running",
                url: waited.url,
                sandboxId: created.sandboxId,
              },
              { status: 200 }
            );
          }
        }
      } catch (e) {
        // start cooldown even on failure (preserve existing sandbox_id)
        await supabase
          .from("preview_environments")
          .update({ sandbox_id: sandboxId })
          .eq("app_name", appName);
        const message = (e as Error)?.message || "create failed";
        console.info("sandbox-status: create failed", {
          appName,
          error: message,
        });
        const status =
          (e as any)?.status ||
          (e as any)?.statusCode ||
          (e as any)?.response?.status ||
          500;
        return NextResponse.json({ error: message }, { status });
      }
    }
    return NextResponse.json({ error: "Not ready" }, { status: 404 });
  } catch (error) {
    console.info("sandbox-status: error", { error: (error as Error)?.message });
    const status =
      (error as any)?.status ||
      (error as any)?.statusCode ||
      (error as any)?.response?.status ||
      500;
    const message = (error as Error)?.message || "Unexpected error";
    return NextResponse.json({ error: message }, { status });
  }
}
