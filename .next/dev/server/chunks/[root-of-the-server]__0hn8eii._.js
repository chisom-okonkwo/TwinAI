module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
function isOllamaMessage(value) {
    if (typeof value !== "object" || value === null) return false;
    const v = value;
    return typeof v.role === "string" && typeof v.content === "string";
}
function isValidBody(value) {
    if (typeof value !== "object" || value === null) return false;
    const v = value;
    if (typeof v.model !== "string" || v.model.trim() === "") return false;
    if (!Array.isArray(v.messages) || !v.messages.every(isOllamaMessage)) return false;
    if (v.systemPrompt !== undefined && typeof v.systemPrompt !== "string") return false;
    return true;
}
async function POST(req) {
    // Parse and validate body
    let body;
    try {
        body = await req.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON in request body."
        }, {
            status: 400
        });
    }
    if (!isValidBody(body)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Bad request. Expected { messages: OllamaMessage[], model: string, systemPrompt?: string }."
        }, {
            status: 400
        });
    }
    const { messages, model, systemPrompt } = body;
    // Prepend system message if a persona prompt was provided
    const ollamaMessages = systemPrompt ? [
        {
            role: "system",
            content: systemPrompt
        },
        ...messages
    ] : messages;
    const baseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:11434";
    const ollamaPayload = {
        model,
        messages: ollamaMessages,
        stream: true
    };
    // Fetch from Ollama
    let ollamaResponse;
    try {
        ollamaResponse = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ollamaPayload)
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ollama daemon is unreachable. Is `ollama serve` running?"
        }, {
            status: 502
        });
    }
    if (!ollamaResponse.ok || ollamaResponse.body === null) {
        const text = await ollamaResponse.text().catch(()=>"");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Ollama returned an error: ${text}`
        }, {
            status: 502
        });
    }
    // Pipe Ollama's ReadableStream straight to the client
    const upstream = ollamaResponse.body;
    const stream = new ReadableStream({
        async start (controller) {
            const reader = upstream.getReader();
            const decoder = new TextDecoder();
            try {
                while(true){
                    const { done, value } = await reader.read();
                    if (done) break;
                    const text = decoder.decode(value, {
                        stream: true
                    });
                    // Ollama sends one JSON object per line
                    for (const line of text.split("\n")){
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        let chunk;
                        try {
                            chunk = JSON.parse(trimmed);
                        } catch  {
                            continue;
                        }
                        controller.enqueue(new TextEncoder().encode(trimmed + "\n"));
                        if (chunk.done) {
                            controller.close();
                            return;
                        }
                    }
                }
                controller.close();
            } catch (err) {
                controller.error(err);
            } finally{
                reader.releaseLock();
            }
        }
    });
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no"
        }
    });
}
function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed."
    }, {
        status: 405
    });
}
function PUT() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed."
    }, {
        status: 405
    });
}
function PATCH() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed."
    }, {
        status: 405
    });
}
function DELETE() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Method not allowed."
    }, {
        status: 405
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0hn8eii._.js.map