const stoppingBoxes = new Set<string>();
const startingBoxes = new Set<string>();
const publishingBoxes = new Set<string>();

export function isBoxStopping(boxId: string): boolean {
  return stoppingBoxes.has(boxId);
}

export async function waitWhileStopping(
  boxId: string,
  timeoutMs = 60_000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (stoppingBoxes.has(boxId)) {
    if (Date.now() >= deadline) {
      stoppingBoxes.delete(boxId);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

export function markStopping(boxId: string): boolean {
  if (stoppingBoxes.has(boxId)) return false;
  stoppingBoxes.add(boxId);
  return true;
}

export function clearStopping(boxId: string): void {
  stoppingBoxes.delete(boxId);
}

export function markStarting(boxId: string): boolean {
  if (startingBoxes.has(boxId)) return false;
  startingBoxes.add(boxId);
  return true;
}

export function clearStarting(boxId: string): void {
  startingBoxes.delete(boxId);
}

export function markPublishing(boxId: string): boolean {
  if (publishingBoxes.has(boxId)) return false;
  publishingBoxes.add(boxId);
  return true;
}

export function clearPublishing(boxId: string): void {
  publishingBoxes.delete(boxId);
}
