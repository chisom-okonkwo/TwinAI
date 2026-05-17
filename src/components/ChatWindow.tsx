"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/lib/types";

type Props = {
  messages: Message[];
  isStreaming: boolean;
};

export default function ChatWindow({ messages, isStreaming }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showFab, setShowFab] = useState(false);

  // True when the user has manually scrolled away from the bottom
  const userScrolledAwayRef = useRef(false);

  // New message added → reset user-scroll state, smooth scroll to bottom
  useEffect(() => {
    userScrolledAwayRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Streaming tokens → instant scroll on every content update, unless user scrolled away
  useEffect(() => {
    if (!isStreaming || userScrolledAwayRef.current) return;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  // Track scroll position: update FAB visibility + user-scroll intent
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledAwayRef.current = distanceFromBottom > 100;
    setShowFab(distanceFromBottom > 200);
  }, []);

  function scrollToBottom() {
    userScrolledAwayRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* Scrollable message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-col flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-1 items-center justify-center">
            <p
              className="text-sm select-none"
              style={{ color: "var(--text-muted, #6B7A99)" }}
            >
              Start a conversation
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        )}

        {/* Sentinel — auto-scroll target */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full text-sm shadow-lg z-10"
            style={{
              background: "var(--bg-elevated, #252540)",
              color: "var(--text-muted, #6B7A99)",
              border: "1px solid var(--border, #2A2A44)",
            }}
            aria-label="Scroll to bottom"
          >
            ↓
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
