export interface OllamaMessage {
  role: string;
  content: string;
}

export interface StreamChunk {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  personaId: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
  avatar?: string;
  description?: string;
}
