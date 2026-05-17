"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PenSquare, Trash2 } from "lucide-react";
import type { Chat, Persona } from "@/lib/types";
import { DEFAULT_PERSONAS, formatTimestamp, truncate } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  chats: Chat[];
  activePersona: Persona;
  activeModel: string;
  activeChatId: string;
  models: string[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onSelectPersona: (p: Persona) => void;
  onSelectModel: (model: string) => void;
};

export default function Sidebar({
  isOpen: _,
  chats,
  activePersona,
  activeModel,
  activeChatId,
  models,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onSelectPersona,
  onSelectModel,
}: Props) {
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{ height: "100vh", background: "var(--bg-base, #0D0D1A)" }}
    >
      {/* ── Section 1: Header ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border, #2A2A44)" }}
      >
        <span
          className="font-medium"
          style={{ fontSize: 15, color: "var(--text-primary, #E8E8F0)" }}
        >
          TwinAI
        </span>
        <button
          onClick={onNewChat}
          aria-label="New chat"
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted, #6B7A99)" }}
        >
          <PenSquare size={16} />
        </button>
      </div>

      {/* ── Section 2: Chat history ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2">
        {sortedChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontSize: 12, color: "var(--text-muted, #6B7A99)" }}>
              No saved chats yet
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sortedChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  onClick={() => onSelectChat(chat.id)}
                  className="group relative flex items-center justify-between gap-2 mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: isActive
                      ? "var(--bg-elevated, #252540)"
                      : "transparent",
                    borderLeft: isActive
                      ? "2px solid #4F9CF9"
                      : "2px solid transparent",
                  }}
                >
                  <span
                    className="truncate"
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary, #E8E8F0)",
                    }}
                  >
                    {truncate(chat.title, 36)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted, #6B7A99)",
                      }}
                    >
                      {formatTimestamp(chat.updatedAt)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      aria-label="Delete chat"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                      style={{ color: "var(--text-muted, #6B7A99)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Section 3: Settings panel ─────────────────────────── */}
      <div
        className="shrink-0 px-3 py-3 flex flex-col gap-3"
        style={{ borderTop: "1px solid var(--border, #2A2A44)" }}
      >
        {/* Model selector */}
        <div className="flex flex-col gap-1">
          <span
            className="uppercase tracking-wider"
            style={{ fontSize: 11, color: "var(--text-muted, #6B7A99)" }}
          >
            Model
          </span>
          <select
            value={activeModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
            style={{
              background: "var(--bg-elevated, #252540)",
              color: "var(--text-primary, #E8E8F0)",
              border: "1px solid var(--border, #2A2A44)",
            }}
          >
            {models.length === 0 ? (
              <option disabled>No models found</option>
            ) : (
              models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Persona picker */}
        <div className="flex flex-col gap-1.5">
          <span
            className="uppercase tracking-wider"
            style={{ fontSize: 11, color: "var(--text-muted, #6B7A99)" }}
          >
            Persona
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {DEFAULT_PERSONAS.map((persona) => {
              const isActive = persona.id === activePersona.id;
              return (
                <motion.button
                  key={persona.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSelectPersona(persona)}
                  className="rounded-lg px-2 py-1.5 text-center transition-colors"
                  style={{
                    fontSize: 12,
                    color: isActive
                      ? "#4F9CF9"
                      : "var(--text-primary, #E8E8F0)",
                    background: isActive
                      ? "var(--bg-elevated, #252540)"
                      : "var(--bg-surface, #1A1A2E)",
                    border: isActive
                      ? "1px solid #4F9CF9"
                      : "1px solid var(--border, #2A2A44)",
                  }}
                >
                  {persona.name}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

