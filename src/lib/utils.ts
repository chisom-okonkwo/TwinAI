import type { Persona } from "@/lib/types";

// ── 1. generateId ─────────────────────────────────────────────────────────────
export function generateId(): string {
  return crypto.randomUUID();
}

// ── 2. formatTimestamp ────────────────────────────────────────────────────────
export function formatTimestamp(ts: number): string {
  const now = Date.now();

  if (now - ts < 60_000) return "just now";

  const date = new Date(ts);
  const today = new Date();

  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (sameDay) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── 3. truncate ───────────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "…";
}

// ── 4. generateChatTitle ──────────────────────────────────────────────────────
export function generateChatTitle(firstMessage: string): string {
  return truncate(firstMessage, 40);
}

// ── 5. DEFAULT_PERSONAS ───────────────────────────────────────────────────────
export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "default",
    name: "Default",
    systemPrompt:
      "You are TwinAI, a helpful, concise, and friendly AI assistant.",
  },
  {
    id: "code-mentor",
    name: "Code Mentor",
    systemPrompt:
      "You are an expert software engineer. Write TypeScript by default. Explain code clearly, follow best practices, and keep responses focused.",
  },
  {
    id: "socratic",
    name: "Socratic Tutor",
    systemPrompt:
      "You are a Socratic tutor. Never give direct answers. Lead with questions that guide the learner to discover the answer themselves.",
  },
  {
    id: "creative",
    name: "Creative Writer",
    systemPrompt:
      "You are a creative writing partner. Be vivid and imaginative. Match the genre and tone the user sets.",
  },
  {
    id: "analyst",
    name: "Research Analyst",
    systemPrompt:
      "You are a rigorous research analyst. Structure your responses, cite your reasoning, and clearly flag any uncertainty.",
  },
];
