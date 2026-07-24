"use client";

import { useEffect, useRef } from "react";

function stopSandboxRequest(projectId: string, reason: string) {
  console.info("[preview:stop-client] request", { projectId, reason });
  const body = JSON.stringify({ projectId });
  void fetch("/api/preview/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "same-origin",
  }).catch((error) => {
    console.info("[preview:stop-client] fetch failed", {
      projectId,
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

/**
 * Stop the Box when leaving the editor (client nav) or closing the tab.
 * Defers unmount stops so React Strict Mode remounts do not archive the box.
 */
export function useStopSandboxOnLeave(
  projectId: string,
  boxId: string | undefined
) {
  const activeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!boxId) {
      console.info("[preview:stop-client] skip — no boxId", { projectId });
      return;
    }

    const key = `${projectId}:${boxId}`;
    activeKeyRef.current = key;
    console.info("[preview:stop-client] armed", { projectId, boxId });

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.info("[preview:stop-client] pagehide persisted — skip", {
          projectId,
        });
        return;
      }
      stopSandboxRequest(projectId, "pagehide");
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (activeKeyRef.current === key) {
        activeKeyRef.current = null;
      }
      window.setTimeout(() => {
        if (activeKeyRef.current === key) {
          console.info("[preview:stop-client] remounted — skip stop", {
            projectId,
            boxId,
          });
          return;
        }
        stopSandboxRequest(projectId, "workspace-unmount");
      }, 500);
    };
  }, [projectId, boxId]);
}
