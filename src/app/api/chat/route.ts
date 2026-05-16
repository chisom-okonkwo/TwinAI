import { NextRequest, NextResponse } from "next/server";
import type { OllamaMessage, StreamChunk } from "@/lib/types";

// ── Request body shape ──
type ChatRequestBody = {
  messages: OllamaMessage[];
  model: string;
  systemPrompt?: string;
};

function isOllamaMessage(value: unknown): value is OllamaMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.role === "string" && typeof v.content === "string";
}

function isValidBody(value: unknown): value is ChatRequestBody {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.model !== "string" || v.model.trim() === "") return false;
  if (!Array.isArray(v.messages) || !v.messages.every(isOllamaMessage))
    return false;
  if (v.systemPrompt !== undefined && typeof v.systemPrompt !== "string")
    return false;
  return true;
}

// ── Route handler ──
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error:
          "Bad request. Expected { messages: OllamaMessage[], model: string, systemPrompt?: string }.",
      },
      { status: 400 }
    );
  }

  const { messages, model, systemPrompt } = body;

  // Prepend system message if a persona prompt was provided
  const ollamaMessages: OllamaMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const baseUrl =
    process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:11434";

  const ollamaPayload = {
    model,
    messages: ollamaMessages,
    stream: true,
  };

  // Fetch from Ollama
  let ollamaResponse: Response;
  try {
    ollamaResponse = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaPayload),
    });
  } catch {
    return NextResponse.json(
      { error: "Ollama daemon is unreachable. Is `ollama serve` running?" },
      { status: 502 }
    );
  }

  if (!ollamaResponse.ok || ollamaResponse.body === null) {
    const text = await ollamaResponse.text().catch(() => "");
    return NextResponse.json(
      { error: `Ollama returned an error: ${text}` },
      { status: 502 }
    );
  }

  // Pipe Ollama's ReadableStream straight to the client
  const upstream = ollamaResponse.body;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });

          // Ollama sends one JSON object per line
          for (const line of text.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let chunk: StreamChunk;
            try {
              chunk = JSON.parse(trimmed) as StreamChunk;
            } catch {
              // Skip malformed lines
              continue;
            }

            controller.enqueue(new TextEncoder().encode(trimmed + "\n"));

            if (chunk.done) {
              controller.close();
              return;
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Return 405 for all other HTTP methods
export function GET(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function PUT(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function PATCH(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function DELETE(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
