"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface Props {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div style={{ borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 12px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          {language.toUpperCase()}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            fontSize: 11,
            color: copied ? "var(--accent-primary)" : "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        wrapLines={true}
        customStyle={{
          background: "var(--code-bg)",
          margin: 0,
          borderRadius: "0 0 6px 6px",
          fontSize: "13px",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const mdComponents: Components = {
  a({ children, href, node: _node, ...rest }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },

  p({ children, node: _node, ...rest }) {
    return (
      <p {...rest} style={{ lineHeight: 1.7, marginBottom: 8 }}>
        {children}
      </p>
    );
  },

  table({ children, node: _node, ...rest }) {
    return (
      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <table
          {...rest}
          style={{
            borderCollapse: "collapse",
            width: "100%",
            border: "1px solid var(--border)",
          }}
        >
          {children}
        </table>
      </div>
    );
  },

  th({ children, node: _node, ...rest }) {
    return (
      <th
        {...rest}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          padding: "6px 12px",
          textAlign: "left",
        }}
      >
        {children}
      </th>
    );
  },

  td({ children, node: _node, ...rest }) {
    return (
      <td
        {...rest}
        style={{ border: "1px solid var(--border)", padding: "6px 12px" }}
      >
        {children}
      </td>
    );
  },

  // Task list checkboxes — read-only, non-interactive
  input({ node: _node, ...rest }) {
    return <input {...rest} readOnly style={{ pointerEvents: "none" }} />;
  },

  // GFM strikethrough
  del({ children, node: _node, ...rest }) {
    return (
      <del
        {...rest}
        style={{ textDecoration: "line-through", color: "var(--text-muted)" }}
      >
        {children}
      </del>
    );
  },

  blockquote({ children, node: _node, ...rest }) {
    return (
      <blockquote
        {...rest}
        style={{
          borderLeft: "3px solid var(--accent-primary)",
          paddingLeft: 12,
          margin: "8px 0",
          color: "var(--text-muted)",
        }}
      >
        {children}
      </blockquote>
    );
  },

  code({ className, children, node: _node, ...rest }) {
    const match = /language-(\w+)/.exec(className ?? "");
    if (match) {
      const language = match[1];
      const code = String(children).replace(/\n$/, "");
      return <CodeBlock language={language} code={code} />;
    }
    // Inline code
    return (
      <code
        {...rest}
        style={{
          background: "var(--code-bg)",
          padding: "2px 6px",
          borderRadius: 4,
          fontFamily: "'Courier New', monospace",
          fontSize: "0.9em",
        }}
      >
        {children}
      </code>
    );
  },
};

export default function MarkdownRenderer({ content, isStreaming = false }: Props) {
  return (
    <div aria-live="polite">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={mdComponents}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && <span className="streaming-cursor">▌</span>}
    </div>
  );
}
