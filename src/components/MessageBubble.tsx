"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { Components } from "react-markdown";
import type { Message } from "@/lib/types";

// ── Timestamp helper ─────────────────────────────────────────────────────────
function formatTimestamp(ts: number): string {
  const diffSeconds = Math.floor((Date.now() - ts) / 1000);
  if (diffSeconds < 60) return "just now";
  const date = new Date(ts);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-0.5 rounded transition-colors"
      style={{
        color: copied ? "#4F9CF9" : "#6B7A99",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Custom markdown renderers ─────────────────────────────────────────────────
function buildComponents(): Components {
  return {
    // Code blocks (fenced)
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? "");
      const language = match ? match[1] : "";
      const codeString = String(children).replace(/\n$/, "");
      const isBlock = !!match;

      if (!isBlock) {
        // Inline code
        return (
          <code
            className="px-1 py-0.5 rounded text-sm font-mono"
            style={{ background: "var(--bg-elevated)", color: "#E8E8F0" }}
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div
          className="rounded-lg overflow-hidden my-3"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-3 py-1"
            style={{
              background: "#1e1e2e",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {language || "text"}
            </span>
            <CopyButton code={codeString} />
          </div>

          {/* Syntax-highlighted block */}
          <SyntaxHighlighter
            language={language || "text"}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.85rem",
              background: "#1e1e2e",
            }}
            codeTagProps={{ style: { fontFamily: "var(--font-mono, monospace)" } }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    },

    // Open links in a new tab
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "var(--accent-primary)" }}
          {...props}
        >
          {children}
        </a>
      );
    },
  };
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
type Props = { message: Message };

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const components = buildComponents();

  return (
    <motion.div
      className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="group relative max-w-[85%] md:max-w-[72%]">
        {/* Bubble */}
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser
              ? "var(--user-bubble, #1E3A5F)"
              : "var(--bg-surface, #1A1A2E)",
            color: "var(--text-primary, #E8E8F0)",
            borderBottomRightRadius: isUser ? 4 : undefined,
            borderBottomLeftRadius: !isUser ? 4 : undefined,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {message.isStreaming
              ? message.content + "▌"
              : message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp — visible on hover */}
        <span
          className={`
            absolute -bottom-5 text-[11px] opacity-0 group-hover:opacity-100
            transition-opacity duration-150 select-none whitespace-nowrap
            ${isUser ? "right-1" : "left-1"}
          `}
          style={{ color: "var(--text-muted, #6B7A99)" }}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
