const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

function processStreamChunk(json, onDelta, onReasoningDelta) {
  const choiceDelta = json.choices?.[0]?.delta;
  if (!choiceDelta) return;

  for (const reasoningChunk of extractReasoningDeltas(choiceDelta)) {
    onReasoningDelta(reasoningChunk);
  }

  const content = choiceDelta.content;
  if (typeof content === "string" && content.length > 0) {
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

  let doneCalled = false;
  const finish = () => {
    if (doneCalled) return;
    doneCalled = true;
    onDone();
  };

  try {
    const body = {
      model,
      messages,
      stream: true,
    };
    if (reasoningOptions) {
      body.reasoning = reasoningOptions;
    }

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

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai-service] streamChat: HTTP error", {
        model,
        status: res.status,
        statusText: res.statusText,
        body: errText.slice(0, 800),
      });
      onError(new Error(`OpenRouter ${res.status}: ${errText.slice(0, 400)}`));
      return;
    }

    if (!res.body) {
      console.error("[ai-service] streamChat: response has no body", { model });
      onError(new Error("OpenRouter response has no body"));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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
            console.error("[ai-service] streamChat: API error in stream", {
              model,
              error: json.error,
            });
            onError(new Error(json.error.message || String(json.error)));
            return;
          }
          processStreamChunk(json, onDelta, onReasoningDelta);
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
            processStreamChunk(json, onDelta, onReasoningDelta);
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    }

    finish();
  } catch (err) {
    console.error("[ai-service] streamChat: exception", {
      model,
      error: err?.message || String(err),
    });
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

module.exports = { streamChat };
