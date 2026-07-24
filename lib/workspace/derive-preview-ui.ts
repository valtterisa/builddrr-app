const LIVE_BOX_STATES = new Set(["ready", "idle", "running"]);
const STARTING_BOX_STATES = new Set([
  "init",
  "provisioning",
  "provisioned",
  "cloning",
]);

export type PreviewUi = {
  screen: {
    title: string;
    body: string;
    spinning: boolean;
    showRestart: boolean;
  };
  badge: string;
};

export function derivePreviewUi(input: {
  state: string | null | "loading";
  waking: boolean;
  restarting: boolean;
  previewOk: boolean;
  previewError: string | null;
  projectLabel?: string;
}): PreviewUi {
  const { state, waking, restarting, previewOk, previewError, projectLabel } =
    input;
  const boxLive = typeof state === "string" && LIVE_BOX_STATES.has(state);

  let badge = "Offline";
  if (previewError && !waking) badge = "Error";
  else if (state === "archiving") badge = "Stopping";
  else if (state === "archived") badge = waking ? "Starting" : "Stopped";
  else if (state === "loading") badge = "Checking";
  else if (state === "error") badge = "Error";
  else if (typeof state === "string" && STARTING_BOX_STATES.has(state))
    badge = "Starting";
  else if (boxLive && previewOk && !waking) badge = projectLabel ?? "Live";
  else if (waking || (boxLive && !previewOk))
    badge = restarting ? "Restarting" : "Starting";

  if (previewError && !waking) {
    return {
      badge,
      screen: {
        title: "Preview failed",
        body: previewError,
        spinning: false,
        showRestart: true,
      },
    };
  }

  if (waking) {
    if (state === "archiving") {
      return {
        badge,
        screen: {
          title: "Stopping sandbox",
          body: "Waiting for the previous stop to finish.",
          spinning: true,
          showRestart: false,
        },
      };
    }
    if (boxLive) {
      return {
        badge,
        screen: {
          title: "Starting preview",
          body: "Waiting until the public preview URL responds.",
          spinning: true,
          showRestart: false,
        },
      };
    }
    return {
      badge,
      screen: {
        title: "Starting sandbox",
        body: "This can take a minute. Hang tight.",
        spinning: true,
        showRestart: false,
      },
    };
  }

  if (boxLive && !previewOk) {
    return {
      badge,
      screen: {
        title: "Preview offline",
        body: "Sandbox is up, but the site preview is not responding.",
        spinning: false,
        showRestart: true,
      },
    };
  }

  const screens: Record<string, PreviewUi["screen"]> = {
    loading: {
      title: "Checking sandbox",
      body: "Reading machine status.",
      spinning: true,
      showRestart: false,
    },
    archived: {
      title: "Sandbox stopped",
      body: "Preview is offline. Restart the preview to wake it up.",
      spinning: false,
      showRestart: true,
    },
    archiving: {
      title: "Stopping sandbox",
      body: "The machine is snapshotting and going offline.",
      spinning: true,
      showRestart: false,
    },
    error: {
      title: "Sandbox error",
      body: "Something went wrong with the machine. Try restarting the preview.",
      spinning: false,
      showRestart: true,
    },
  };

  if (state && screens[state]) {
    return { badge, screen: screens[state]! };
  }
  if (typeof state === "string" && STARTING_BOX_STATES.has(state)) {
    return {
      badge,
      screen: {
        title: "Starting sandbox",
        body: "The machine is still coming online.",
        spinning: true,
        showRestart: false,
      },
    };
  }
  if (state === null) {
    return {
      badge,
      screen: {
        title: "No sandbox",
        body: "Generate a site to provision a preview machine.",
        spinning: false,
        showRestart: false,
      },
    };
  }
  return {
    badge,
    screen: {
      title: "Sandbox unavailable",
      body: "Preview is not ready yet. Try restarting the preview.",
      spinning: false,
      showRestart: true,
    },
  };
}

export { LIVE_BOX_STATES, STARTING_BOX_STATES };
