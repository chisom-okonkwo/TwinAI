"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Chat, Message, Persona, StreamChunk } from "@/lib/types";
import { DEFAULT_PERSONAS, generateChatTitle } from "@/lib/utils";

const STORAGE_KEY = "twinai-chats";

type UseChatReturn = {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  selectedModel: string;
  selectedPersona: Persona;
  currentChatId: string;
  allChats: Chat[];
  setSelectedModel: (model: string) => void;
  setPersona: (persona: Persona) => void;
  setModel: (model: string) => void;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  newChat: () => void;
  loadChat: (id: string) => void;
  deleteChat: (id: string) => void;
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemma3:4b");
  const [selectedPersona, setPersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
  const [currentChatId, setCurrentChatId] = useState<string>(() =>
    crypto.randomUUID()
  );
  const [allChats, setAllChats] = useState<Chat[]>([]);

  // Refs so callbacks never go stale without needing broad dep arrays
  const messagesRef = useRef<Message[]>([]);
  const isStreamingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allChatsRef = useRef<Chat[]>(allChats);
  const currentChatIdRef = useRef<string>(currentChatId);

  // Keep refs in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    allChatsRef.current = allChats;
  }, [allChats]);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Hydrate allChats from localStorage after first client render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Chat[];
        setAllChats(parsed);
        allChatsRef.current = parsed;
      }
    } catch {
      // keep []
    }
  }, []);

  // ── persistChats ─────────────────────────────────────────────────────────────
  const persistChats = useCallback((updatedChats: Chat[]): void => {
    setAllChats(updatedChats);
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
    }, 300);
  }, []);

  // ── buildAndSaveChat ──────────────────────────────────────────────────────────
  const buildAndSaveChat = useCallback((): void => {
    const currentMessages = messagesRef.current;
    const chatId = currentChatIdRef.current;
    const existingChat = allChatsRef.current.find((c) => c.id === chatId);
    const firstUserMessage = currentMessages.find((m) => m.role === "user");

    const chat: Chat = {
      id: chatId,
      title: generateChatTitle(firstUserMessage?.content ?? "New chat"),
      messages: currentMessages,
      personaId: selectedPersona.id,
      model: selectedModel,
      createdAt: existingChat?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    const updated = existingChat
      ? allChatsRef.current.map((c) => (c.id === chatId ? chat : c))
      : [...allChatsRef.current, chat];

    persistChats(updated);
  }, [selectedModel, selectedPersona, persistChats]);

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

  // ── loadChat ──────────────────────────────────────────────────────────────────
  const loadChat = useCallback((id: string): void => {
    const chat = allChatsRef.current.find((c) => c.id === id);
    if (!chat) return;
    setMessages(chat.messages);
    setSelectedModel(chat.model);
    setCurrentChatId(chat.id);
    const persona =
      DEFAULT_PERSONAS.find((p) => p.id === chat.personaId) ??
      DEFAULT_PERSONAS[0];
    setPersona(persona);
  }, []);

  // ── deleteChat ────────────────────────────────────────────────────────────────
  const deleteChat = useCallback(
    (id: string): void => {
      const filtered = allChatsRef.current.filter((c) => c.id !== id);
      persistChats(filtered);
      if (id === currentChatIdRef.current) newChat();
    },
    [persistChats, newChat]
  );

  // ── setModel ──────────────────────────────────────────────────────────────────
  const setModel = useCallback((model: string): void => {
    setSelectedModel(model);
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
      // Prepend the active persona's system prompt if set
      const systemMessage =
        selectedPersona.systemPrompt.trim().length > 0
          ? [{ role: "system", content: selectedPersona.systemPrompt }]
          : [];

      const messagesForRequest = [
        ...systemMessage,
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
        buildAndSaveChat();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — freeze the assistant message as-is
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, isStreaming: false } : msg
            )
          );
        } else {
          buildAndSaveChat();
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
    [selectedModel, selectedPersona, buildAndSaveChat]
  );

  return {
    messages,
    isStreaming,
    error,
    selectedModel,
    selectedPersona,
    currentChatId,
    allChats,
    setSelectedModel,
    setPersona,
    setModel,
    sendMessage,
    cancelStream,
    newChat,
    loadChat,
    deleteChat,
  };
}
