"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";

const SIDEBAR_WIDTH = 280;

export default function Home() {
  const {
    messages,
    isStreaming,
    sendMessage,
    cancelStream,
    newChat,
    selectedModel,
    selectedPersona,
    setPersona,
  } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    // Full-viewport shell
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-base, #0D0D1A)" }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden md:flex flex-col shrink-0 overflow-hidden"
        style={{
          background: "var(--bg-surface, #1A1A2E)",
          borderRight: sidebarOpen ? "1px solid var(--border, #2A2A44)" : "none",
        }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          chats={[]}
          activePersona={selectedPersona}
          activeModel={selectedModel}
          activeChatId=""
          models={[]}
          onNewChat={newChat}
          onSelectChat={() => {}}
          onDeleteChat={() => {}}
          onSelectPersona={setPersona}
          onSelectModel={() => {}}
        />
      </motion.aside>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-20 md:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed top-0 left-0 h-full z-30 flex flex-col md:hidden"
              style={{
                width: SIDEBAR_WIDTH,
                background: "var(--bg-surface, #1A1A2E)",
                borderRight: "1px solid var(--border, #2A2A44)",
              }}
            >
              <Sidebar
                isOpen={sidebarOpen}
                chats={[]}
                activePersona={selectedPersona}
                activeModel={selectedModel}
                activeChatId=""
                models={[]}
                onNewChat={() => {
                  newChat();
                  setSidebarOpen(false);
                }}
                onSelectChat={() => {}}
                onDeleteChat={() => {}}
                onSelectPersona={setPersona}
                onSelectModel={() => {}}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border, #2A2A44)" }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "var(--text-muted, #6B7A99)" }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-muted, #6B7A99)" }}
          >
            TwinAI
          </span>
        </header>

        {/* Message list — fills remaining height */}
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-[720px] mx-auto px-2">
          <ChatWindow messages={messages} isStreaming={isStreaming} />

          {/* Sticky input */}
          <div className="shrink-0 pb-4 pt-2">
            <ChatInput
              onSend={(content) => void sendMessage(content)}
              isStreaming={isStreaming}
              onCancel={cancelStream}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
