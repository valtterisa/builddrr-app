"use client";

import { useState } from "react";
import { Loader2, MonitorSmartphone, RotateCw } from "lucide-react";
import { toast } from "sonner";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  draft: "Queued",
  provisioning: "Getting ready",
  generating: "Building",
  ready: "Live",
  error: "Error",
};

export function PreviewPane({
  projectId,
  status,
  previewUrl,
  boxId,
}: {
  projectId: string;
  status?: string;
  previewUrl?: string;
  boxId?: string;
}) {
  const label = STATUS_LABEL[status ?? "draft"] ?? status;
  const busy = status === "provisioning" || status === "generating";
  const [restarting, setRestarting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const onRestart = async () => {
    if (!boxId || restarting) return;
    setRestarting(true);
    try {
      const res = await fetch("/api/preview/restart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const message = data.error || "Could not restart sandbox.";
        throw new Error(
          data.detail && data.detail !== message
            ? `${message} ${data.detail.slice(0, 240)}`
            : message
        );
      }
      setReloadKey((k) => k + 1);
      toast.success("Sandbox restarted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not restart sandbox."
      );
    } finally {
      setRestarting(false);
    }
  };

  if (!previewUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-card/20 text-center">
        {busy ? (
          <Loader2 className="size-7 animate-spin text-brand" />
        ) : (
          <MonitorSmartphone className="size-7 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {busy
              ? "Your live preview will appear here in a moment."
              : "Switch to Build and send a prompt to generate a live preview."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <WebPreview
      key={`${previewUrl}-${reloadKey}`}
      defaultUrl={previewUrl}
      className="h-full rounded-none border-0"
    >
      <WebPreviewNavigation className="gap-2 px-3">
        <Badge
          variant="outline"
          className={
            restarting
              ? "border-border text-xs font-normal text-muted-foreground"
              : "border-brand/40 text-xs font-normal text-brand"
          }
        >
          {restarting ? "Restarting" : label}
        </Badge>
        <WebPreviewUrl readOnly />
        <WebPreviewNavigationButton
          tooltip={restarting ? "Restarting sandbox…" : "Restart sandbox"}
          disabled={!boxId || restarting || busy}
          onClick={() => void onRestart()}
          aria-label="Restart sandbox"
        >
          {restarting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCw className="size-4" />
          )}
        </WebPreviewNavigationButton>
      </WebPreviewNavigation>
      <div className="relative min-h-0 flex-1">
        <WebPreviewBody
          src={restarting ? undefined : previewUrl}
          className="bg-white"
        />
        {restarting ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <Loader2 className="size-7 animate-spin text-brand" />
            <div>
              <p className="text-sm font-medium">Restarting sandbox</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Stopping and resuming the machine, then bringing Astro back up.
                This can take a minute. Hang tight.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </WebPreview>
  );
}
