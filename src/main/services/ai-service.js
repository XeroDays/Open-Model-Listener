const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function maskApiKey(key) {
  if (typeof key !== "string" || key.length < 8) return "(missing)";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function summarizeMessages(messages) {
  if (!Array.isArray(messages)) return { messageCount: 0, promptChars: 0, roles: [] };
  const roles = messages.map((m) => m?.role).filter(Boolean);
  const promptChars = messages.reduce(
    (sum, m) => sum + (typeof m?.content === "string" ? m.content.length : 0),
    0
  );
  return { messageCount: messages.length, promptChars, roles };
}

function extractReasoningDeltas(delta) {
  if (!delta || typeof delta !== "object") return [];

  const chunks = [];

  if (typeof delta.reasoning === "string" && delta.reasoning.length > 0) {
    chunks.push(delta.reasoning);
  }
  if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
    chunks.push(delta.reasoning_content);
  }
  if (Array.isArray(delta.reasoning_details)) {
    for (const detail of delta.reasoning_details) {
      if (detail?.type === "reasoning.text" && typeof detail.text === "string" && detail.text.length > 0) {
        chunks.push(detail.text);
      }
    }
  }

  return chunks;
}

function processStreamChunk(json, onDelta, onReasoningDelta, stats) {
  const choiceDelta = json.choices?.[0]?.delta;
  if (!choiceDelta) return;

  if (json.usage && typeof json.usage === "object") {
    stats.lastUsage = json.usage;
  }

  for (const reasoningChunk of extractReasoningDeltas(choiceDelta)) {
    if (stats.reasoningCount === 0) {
      stats.timeToFirstReasoningMs = Date.now() - stats.startedAt;
    }
    stats.reasoningCount += 1;
    stats.reasoningChars += reasoningChunk.length;
    onReasoningDelta(reasoningChunk);
  }

  const content = choiceDelta.content;
  if (typeof content === "string" && content.length > 0) {
    if (stats.deltaCount === 0) {
      stats.timeToFirstContentMs = Date.now() - stats.startedAt;
    }
    stats.deltaCount += 1;
    stats.deltaChars += content.length;
    onDelta(content);
  }
}

async function streamChat(
  messages,
  model,
  apiKey,
  reasoningOptions,
  onDelta,
  onDone,
  onError,
  onReasoningDelta = () => {}
) {
  if (!apiKey) {
    const err = new Error("API key is not configured. Go back and enter your OpenRouter API key.");
    console.error("[ai-service] streamChat: missing API key");
    onError(err);
    return;
  }
  if (!model) {
    const err = new Error("Model is not configured.");
    console.error("[ai-service] streamChat: missing model");
    onError(err);
    return;
  }

  const startedAt = Date.now();
  const msgSummary = summarizeMessages(messages);
  const stats = {
    startedAt,
    deltaCount: 0,
    deltaChars: 0,
    reasoningCount: 0,
    reasoningChars: 0,
    sseChunks: 0,
    lastUsage: null,
    timeToFirstByteMs: null,
    timeToFirstContentMs: null,
    timeToFirstReasoningMs: null,
  };

  let doneCalled = false;
  const finish = () => {
    if (doneCalled) return;
    doneCalled = true;
    console.log("[ai-service] streamChat ✓ done", {
      model,
      deltaCount: stats.deltaCount,
      deltaChars: stats.deltaChars,
      reasoningCount: stats.reasoningCount,
      reasoningChars: stats.reasoningChars,
      sseChunks: stats.sseChunks,
      usage: stats.lastUsage,
      timeToFirstByteMs: stats.timeToFirstByteMs,
      timeToFirstContentMs: stats.timeToFirstContentMs,
      timeToFirstReasoningMs: stats.timeToFirstReasoningMs,
      totalElapsedMs: Date.now() - startedAt,
    });
    onDone();
  };

  const body = {
    model,
    messages,
    stream: true,
    usage: { include: true },
  };
  if (reasoningOptions) {
    body.reasoning = reasoningOptions;
  }

  console.log("[ai-service] streamChat → request", {
    url: OPENROUTER_URL,
    method: "POST",
    model,
    stream: true,
    apiKey: maskApiKey(apiKey),
    messageCount: msgSummary.messageCount,
    promptChars: msgSummary.promptChars,
    roles: msgSummary.roles,
    reasoning: reasoningOptions ?? null,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${maskApiKey(apiKey)}`,
      "HTTP-Referer": "https://github.com/XeroDays/Open-Model-Listener",
      "X-Title": "Open Model Listener",
    },
  });

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/XeroDays/Open-Model-Listener",
        "X-Title": "Open Model Listener",
      },
      body: JSON.stringify(body),
    });

    stats.timeToFirstByteMs = Date.now() - startedAt;

    console.log("[ai-service] streamChat ← response", {
      model,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      elapsedMs: stats.timeToFirstByteMs,
      contentType: res.headers.get("content-type"),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai-service] streamChat ✗ HTTP error", {
        model,
        status: res.status,
        statusText: res.statusText,
        elapsedMs: Date.now() - startedAt,
        body: errText.slice(0, 800),
      });
      onError(new Error(`OpenRouter ${res.status}: ${errText.slice(0, 400)}`));
      return;
    }

    if (!res.body) {
      console.error("[ai-service] streamChat ✗ response has no body", {
        model,
        elapsedMs: Date.now() - startedAt,
      });
      onError(new Error("OpenRouter response has no body"));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      stats.sseChunks += 1;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() || "";

      for (const rawLine of parts) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          finish();
          return;
        }
        try {
          const json = JSON.parse(data);
          if (json.error) {
            console.error("[ai-service] streamChat ✗ API error in stream", {
              model,
              elapsedMs: Date.now() - startedAt,
              error: json.error,
            });
            onError(new Error(json.error.message || String(json.error)));
            return;
          }
          processStreamChunk(json, onDelta, onReasoningDelta, stats);
        } catch {
          // skip malformed SSE chunks
        }
      }
    }

    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith("data:")) {
        const data = line.slice(5).trim();
        if (data !== "[DONE]") {
          try {
            const json = JSON.parse(data);
            processStreamChunk(json, onDelta, onReasoningDelta, stats);
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    }

    finish();
  } catch (err) {
    console.error("[ai-service] streamChat ✗ exception", {
      model,
      elapsedMs: Date.now() - startedAt,
      error: err?.message || String(err),
    });
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

module.exports = { streamChat };
