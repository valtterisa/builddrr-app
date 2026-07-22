export async function triggerGeneration(projectId: string): Promise<void> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    let message = "Could not start generation";
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
