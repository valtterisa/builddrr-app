export const SITE_DIR = "site";
export const PREVIEW_PORT = 4321;

export function goldenBoxId(): string | undefined {
  const id = process.env.BOX_GOLDEN_BOX_ID?.trim();
  return id || undefined;
}

export function boxLog(
  boxId: string,
  stage: string,
  message: string,
  extra?: Record<string, unknown>
) {
  if (process.env.DEBUG_BOX !== "1") return;
  console.info(`[box:${stage}] ${message}`, {
    boxId,
    at: new Date().toISOString(),
    ...extra,
  });
}

export function cfEnvPath(boxId: string): string {
  const safe = boxId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "box";
  return `.floras-cf-${safe}-${Date.now()}.env`;
}
