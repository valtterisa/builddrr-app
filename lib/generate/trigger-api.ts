async function triggerApi(
  path: "/api/generate" | "/api/ask",
  projectId: string,
  fallbackMessage: string
): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    let message = fallbackMessage;
    let code: string | undefined;
    try {
      const data = (await res.json()) as { error?: string; code?: string };
      if (data.error) message = data.error;
      code = data.code;
    } catch {
    }
    const error = new Error(message) as Error & { code?: string };
    error.code = code;
    throw error;
  }
}

export async function triggerGeneration(projectId: string): Promise<void> {
  return triggerApi("/api/generate", projectId, "Could not start generation");
}

export async function triggerAsk(projectId: string): Promise<void> {
  return triggerApi("/api/ask", projectId, "Could not ask Floras");
}
