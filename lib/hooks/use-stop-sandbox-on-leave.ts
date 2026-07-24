"use client";

import { useEffect, useRef } from "react";

function stopSandboxRequest(projectId: string, reason: string) {
  if (process.env.NODE_ENV === "development") {
    console.info("[preview:stop-client] request", { projectId, reason });
  }
  const body = JSON.stringify({ projectId });
  void fetch("/api/preview/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "same-origin",
  }).catch((error) => {
    console.warn("[preview:stop-client] fetch failed", {
      projectId,
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

/**
 * Stop the Box when leaving the editor (client nav) or closing the tab.
 * Defers unmount stops so React Strict Mode remounts do not archive the box.
 * Skips while the project is busy so generation is not interrupted.
 */
export function useStopSandboxOnLeave(
  projectId: string,
  boxId: string | undefined,
  opts: { enabled?: boolean } = {}
) {
  const enabled = opts.enabled ?? true;
  const activeKeyRef = useRef<string | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;

    if (!boxId || !enabled) {
      return;
    }

    const key = `${projectId}:${boxId}`;
    activeKeyRef.current = key;

    const stopOnce = (reason: string) => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      stopSandboxRequest(projectId, reason);
    };

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      stopOnce("pagehide");
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (activeKeyRef.current === key) {
        activeKeyRef.current = null;
      }
      window.setTimeout(() => {
        if (activeKeyRef.current === key) return;
        if (!enabled) return;
        stopOnce("workspace-unmount");
      }, 500);
    };
  }, [projectId, boxId, enabled]);
}
