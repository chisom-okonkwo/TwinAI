"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, StreamChunk } from "@/lib/types";

type UseChatReturn = {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  selectedModel: string;
  currentChatId: string;
  setSelectedModel: (model: string) => void;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  newChat: () => void;
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemma3:4b");
  const [currentChatId, setCurrentChatId] = useState<string>(() =>
    crypto.randomUUID()
  );

  // Refs so callbacks never go stale without needing broad dep arrays
  const messagesRef = useRef<Message[]>([]);
  const isStreamingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ── cancelStream ────────────────────────────────────────────────────────────
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // ── newChat ──────────────────────────────────────────────────────────────────
  const newChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setError(null);
    setCurrentChatId(crypto.randomUUID());
  }, []);

  // ── sendMessage ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (isStreamingRef.current) return;

      setError(null);

      // Append user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Snapshot current messages + new user turn for the request
      const messagesForRequest = [
        ...messagesRef.current.map(({ role, content: c }) => ({
          role,
          content: c,
        })),
        { role: "user", content },
      ];

      // Setup abort + streaming flag
      const controller = new AbortController();
      abortControllerRef.current = controller;
      isStreamingRef.current = true;
      setIsStreaming(true);

      // Placeholder assistant message
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          isStreaming: true,
        } satisfies Message,
      ]);

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messagesForRequest,
            model: selectedModel,
          }),
          signal: controller.signal,
        });

        if (!response.ok || response.body === null) {
          const text = await response.text().catch(() => "Unknown error");
          throw new Error(text);
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let chunk: StreamChunk;
            try {
              chunk = JSON.parse(trimmed) as StreamChunk;
            } catch {
              continue;
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content: msg.content + chunk.message.content,
                      isStreaming: !chunk.done,
                    }
                  : msg
              )
            );

            if (chunk.done) break outer;
          }
        }

        // Finalize if stream ended without a done:true chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, isStreaming: false } : msg
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — freeze the assistant message as-is
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, isStreaming: false } : msg
            )
          );
        } else {
          const message =
            err instanceof Error ? err.message : "An unknown error occurred.";
          setError(message);
          // Remove the empty placeholder on hard errors
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
        }
      } finally {
        reader?.releaseLock();
        isStreamingRef.current = false;
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [selectedModel]
  );

  return {
    messages,
    isStreaming,
    error,
    selectedModel,
    currentChatId,
    setSelectedModel,
    sendMessage,
    cancelStream,
    newChat,
  };
}
