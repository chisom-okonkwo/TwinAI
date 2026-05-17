import type { OllamaMessage } from "@/lib/types";

// ── Base URL helper ───────────────────────────────────────────────────────────
function getBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(
    /\/$/,
    ""
  );
}

// ── Response shape from GET /api/tags ────────────────────────────────────────
type OllamaTagsResponse = {
  models: Array<{ name: string }>;
};

// ── 1. createOllamaRequest ────────────────────────────────────────────────────
export function createOllamaRequest(
  messages: OllamaMessage[],
  model: string,
  systemPrompt?: string
): { model: string; messages: OllamaMessage[]; stream: boolean } {
  const allMessages: OllamaMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : [...messages];

  return { model, messages: allMessages, stream: true };
}

// ── 2. listModels ─────────────────────────────────────────────────────────────
export async function listModels(): Promise<string[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`);
    if (!response.ok) return [];
    const data = (await response.json()) as OllamaTagsResponse;
    return data.models.map((m) => m.name);
  } catch {
    return [];
  }
}

// ── 3. streamOllamaResponse ───────────────────────────────────────────────────
export async function streamOllamaResponse(
  payload: ReturnType<typeof createOllamaRequest>
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${getBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "no detail");
    throw new Error(
      `Ollama responded with ${response.status}: ${detail}`
    );
  }

  if (response.body === null) {
    throw new Error("Ollama returned a null response body.");
  }

  return response.body;
}
