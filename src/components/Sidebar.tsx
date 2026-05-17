"use client";

import { motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  onNewChat: () => void;
};

export default function Sidebar({ isOpen: _, onNewChat }: Props) {
  return (
    <div className="flex flex-col h-full w-full px-3 py-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--text-primary, #E8E8F0)" }}
        >
          TwinAI
        </span>
      </div>

      {/* New chat button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNewChat}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors w-full"
        style={{
          background: "var(--bg-elevated, #252540)",
          color: "var(--text-primary, #E8E8F0)",
          border: "1px solid var(--border, #2A2A44)",
        }}
      >
        <span>＋</span>
        <span>New chat</span>
      </motion.button>

      {/* Chat history placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs" style={{ color: "var(--text-muted, #6B7A99)" }}>
          Chat history coming soon
        </p>
      </div>
    </div>
  );
}
