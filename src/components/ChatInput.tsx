"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onCancel: () => void;
};

export default function ChatInput({ onSend, isStreaming, onCancel }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // line-height ≈ 24px; cap at 6 lines = 144px
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div
      className="flex items-end gap-2 w-full rounded-2xl px-4 py-3"
      style={{
        background: "var(--bg-elevated, #252540)",
        border: "1px solid var(--border, #2A2A44)",
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Message TwinAI…"
        disabled={isStreaming}
        className="flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:opacity-40 disabled:opacity-50"
        style={{ color: "var(--text-primary, #E8E8F0)", maxHeight: "144px" }}
      />

      {isStreaming ? (
        <button
          onClick={onCancel}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: "var(--bg-surface, #1A1A2E)",
            color: "var(--text-muted, #6B7A99)",
            border: "1px solid var(--border, #2A2A44)",
          }}
        >
          Cancel
        </button>
      ) : (
        <motion.button
          whileTap={{ scale: canSend ? 0.92 : 1 }}
          onClick={submit}
          disabled={!canSend}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSend
              ? "var(--accent-primary, #4F9CF9)"
              : "var(--bg-surface, #1A1A2E)",
            color: canSend ? "#fff" : "var(--text-muted, #6B7A99)",
            border: canSend ? "none" : "1px solid var(--border, #2A2A44)",
          }}
        >
          Send
        </motion.button>
      )}
    </div>
  );
}
