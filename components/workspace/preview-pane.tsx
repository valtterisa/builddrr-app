"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MonitorSmartphone, RotateCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { Badge } from "@/components/ui/badge";
import {
  derivePreviewUi,
  LIVE_BOX_STATES,
  STARTING_BOX_STATES,
} from "@/lib/workspace/derive-preview-ui";

const PROJECT_STATUS_LABEL: Record<string, string> = {
  draft: "Queued",
  provisioning: "Getting ready",
  generating: "Building",
  ready: "Live",
  error: "Error",
};

const pendingStarts = new Map<string, Promise<void>>();
const PREVIEW_OK_GRACE_MS = 20_000;

function ensurePreviewStarted(projectId: string): Promise<void> {
  const existing = pendingStarts.get(projectId);
  if (existing) return existing;

  const run = (async () => {
    const res = await fetch("/api/preview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Could not start sandbox.");
    }
  })().finally(() => {
    pendingStarts.delete(projectId);
  });

  pendingStarts.set(projectId, run);
  return run;
}

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
  const projectLabel = PROJECT_STATUS_LABEL[status ?? "draft"] ?? status;
  const busy = status === "provisioning" || status === "generating";
  const [restarting, setRestarting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [boxState, setBoxState] = useState<string | null | "loading">(
    boxId ? "loading" : null
  );
  const [previewOk, setPreviewOk] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const graceUntilRef = useRef(0);

  const waking = restarting || starting;

  useEffect(() => {
    if (!boxId || busy) return;

    let cancelled = false;
    setStarting(true);
    setPreviewError(null);

    void ensurePreviewStarted(projectId)
      .then(() => {
        if (cancelled) return;
        graceUntilRef.current = Date.now() + PREVIEW_OK_GRACE_MS;
        setPreviewOk(true);
        setPreviewError(null);
        setReloadKey((k) => k + 1);
      })
      .catch((error) => {
        if (cancelled) return;
        setPreviewOk(false);
        const message =
          error instanceof Error ? error.message : "Could not start sandbox.";
        setPreviewError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setStarting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, boxId, busy]);

  useEffect(() => {
    if (!boxId) {
      setBoxState(null);
      setPreviewOk(false);
      setPreviewError(null);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/preview/status?projectId=${encodeURIComponent(projectId)}`
        );
        const data = (await res.json().catch(() => ({}))) as {
          state?: string | null;
          previewOk?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setBoxState((prev) => (prev === "loading" ? null : prev));
          return;
        }
        setBoxState(data.state ?? null);
        if (!waking) {
          const ok = Boolean(data.previewOk);
          if (ok) {
            setPreviewOk(true);
            setPreviewError(null);
          } else if (Date.now() >= graceUntilRef.current) {
            setPreviewOk(false);
          }
        }
      } catch {
        if (!cancelled) {
          setBoxState((prev) => (prev === "loading" ? null : prev));
        }
      }
    };

    void poll();
    const id = window.setInterval(
      () => void poll(),
      waking ? 2000 : previewOk ? 8000 : 5000
    );
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [projectId, boxId, waking, previewOk]);

  const onRestart = async () => {
    if (!boxId || waking) return;
    setRestarting(true);
    setPreviewOk(false);
    setPreviewError(null);
    try {
      const res = await fetch("/api/preview/restart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not restart sandbox.");
      }
      graceUntilRef.current = Date.now() + PREVIEW_OK_GRACE_MS;
      setReloadKey((k) => k + 1);
      setPreviewOk(true);
      setPreviewError(null);
      toast.success("Sandbox restarted.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not restart sandbox.";
      setPreviewError(message);
      toast.error(message);
    } finally {
      setRestarting(false);
    }
  };

  if (!previewUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background text-center">
        {busy ? (
          <Loader2 className="size-7 animate-spin text-brand" />
        ) : (
          <MonitorSmartphone className="size-7 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">{projectLabel}</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {busy
              ? "Your live preview will appear here in a moment."
              : "Switch to Build and send a prompt to generate a live preview."}
          </p>
        </div>
      </div>
    );
  }

  const boxLive =
    typeof boxState === "string" && LIVE_BOX_STATES.has(boxState);
  const showOwnUi = waking || !boxLive || !previewOk || Boolean(previewError);
  const { screen, badge: badgeLabel } = derivePreviewUi({
    state: boxState,
    waking,
    restarting,
    previewOk,
    previewError,
    projectLabel,
  });

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
            boxLive && previewOk && !waking && !previewError
              ? "border-brand/40 text-xs font-normal text-brand"
              : "border-border text-xs font-normal text-muted-foreground"
          }
        >
          {badgeLabel}
        </Badge>
        <WebPreviewUrl readOnly />
        <WebPreviewNavigationButton
          tooltip="Open preview in new tab"
          disabled={!previewUrl || waking}
          onClick={() => {
            if (previewUrl) {
              window.open(previewUrl, "_blank", "noopener,noreferrer");
            }
          }}
          aria-label="Open preview in new tab"
        >
          <ExternalLink className="size-4" />
        </WebPreviewNavigationButton>
        <WebPreviewNavigationButton
          tooltip={waking ? "Starting sandbox…" : "Restart sandbox"}
          disabled={!boxId || waking || busy}
          onClick={() => void onRestart()}
          aria-label="Restart sandbox"
        >
          {waking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCw className="size-4" />
          )}
        </WebPreviewNavigationButton>
      </WebPreviewNavigation>
      <div className="relative min-h-0 flex-1 bg-background">
        {showOwnUi ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            {screen.spinning ? (
              <Loader2 className="size-7 animate-spin text-brand" />
            ) : (
              <MonitorSmartphone className="size-7 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">{screen.title}</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {screen.body}
              </p>
            </div>
            {screen.showRestart && boxId && !busy ? (
              <button
                type="button"
                onClick={() => void onRestart()}
                disabled={waking}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 border border-border bg-background px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCw className="size-3.5" />
                Restart preview
              </button>
            ) : null}
          </div>
        ) : (
          <div className="absolute inset-0">
            <WebPreviewBody src={previewUrl} className="bg-white" />
          </div>
        )}
      </div>
    </WebPreview>
  );
}
