module.exports = [
"[project]/src/hooks/useChat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useChat",
    ()=>useChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useChat() {
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isStreaming, setIsStreaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedModel, setSelectedModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("gemma3:4b");
    const [currentChatId, setCurrentChatId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>crypto.randomUUID());
    // Refs so callbacks never go stale without needing broad dep arrays
    const messagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const isStreamingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const abortControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Keep messagesRef in sync
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        messagesRef.current = messages;
    }, [
        messages
    ]);
    // ── cancelStream ────────────────────────────────────────────────────────────
    const cancelStream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        abortControllerRef.current?.abort();
    }, []);
    // ── newChat ──────────────────────────────────────────────────────────────────
    const newChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        abortControllerRef.current?.abort();
        setMessages([]);
        setIsStreaming(false);
        setError(null);
        setCurrentChatId(crypto.randomUUID());
    }, []);
    // ── sendMessage ──────────────────────────────────────────────────────────────
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (content)=>{
        if (isStreamingRef.current) return;
        setError(null);
        // Append user message
        const userMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            timestamp: Date.now()
        };
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        // Snapshot current messages + new user turn for the request
        const messagesForRequest = [
            ...messagesRef.current.map(({ role, content: c })=>({
                    role,
                    content: c
                })),
            {
                role: "user",
                content
            }
        ];
        // Setup abort + streaming flag
        const controller = new AbortController();
        abortControllerRef.current = controller;
        isStreamingRef.current = true;
        setIsStreaming(true);
        // Placeholder assistant message
        const assistantId = crypto.randomUUID();
        setMessages((prev)=>[
                ...prev,
                {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    timestamp: Date.now(),
                    isStreaming: true
                }
            ]);
        let reader = null;
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: messagesForRequest,
                    model: selectedModel
                }),
                signal: controller.signal
            });
            if (!response.ok || response.body === null) {
                const text = await response.text().catch(()=>"Unknown error");
                throw new Error(text);
            }
            reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            outer: while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split("\n");
                // Keep the last (potentially incomplete) line in the buffer
                buffer = lines.pop() ?? "";
                for (const line of lines){
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    let chunk;
                    try {
                        chunk = JSON.parse(trimmed);
                    } catch  {
                        continue;
                    }
                    setMessages((prev)=>prev.map((msg)=>msg.id === assistantId ? {
                                ...msg,
                                content: msg.content + chunk.message.content,
                                isStreaming: !chunk.done
                            } : msg));
                    if (chunk.done) break outer;
                }
            }
            // Finalize if stream ended without a done:true chunk
            setMessages((prev)=>prev.map((msg)=>msg.id === assistantId ? {
                        ...msg,
                        isStreaming: false
                    } : msg));
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                // User cancelled — freeze the assistant message as-is
                setMessages((prev)=>prev.map((msg)=>msg.id === assistantId ? {
                            ...msg,
                            isStreaming: false
                        } : msg));
            } else {
                const message = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(message);
                // Remove the empty placeholder on hard errors
                setMessages((prev)=>prev.filter((msg)=>msg.id !== assistantId));
            }
        } finally{
            reader?.releaseLock();
            isStreamingRef.current = false;
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [
        selectedModel
    ]);
    return {
        messages,
        isStreaming,
        error,
        selectedModel,
        currentChatId,
        setSelectedModel,
        sendMessage,
        cancelStream,
        newChat
    };
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/page.tsx'\n\nExpected ';', '}' or <eof>");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_03rtusn._.js.map