"use client";

import { useEffect } from "react";

function stopSandboxBeacon(projectId: string) {
  const body = JSON.stringify({ projectId });
  const blob = new Blob([body], { type: "application/json" });
  const queued = navigator.sendBeacon("/api/preview/stop", blob);
  if (queued) return;
  void fetch("/api/preview/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

/**
 * Stop the Box only when the tab is closing / leaving the site.
 * Do not stop on React effect cleanup — that races Strict Mode remounts and
 * mid-start Convex flickers, and archives the machine while Astro is still booting.
 */
export function useStopSandboxOnLeave(
  projectId: string,
  boxId: string | undefined
) {
  useEffect(() => {
    if (!boxId) return;

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      stopSandboxBeacon(projectId);
    };

    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [projectId, boxId]);
}
