const channels = require("../../shared/ipc/channels");
const configService = require("../services/config-service");
const aiService = require("../services/ai-service");

function buildReasoningOptions(level) {
  switch (level) {
    case "None":
      return { effort: "none", exclude: true };
    case "Low":
      return { effort: "low" };
    case "Medium":
      return { effort: "medium" };
    case "High":
      return { effort: "high" };
    case "Ultra High":
      return { max_tokens: 16000 };
    default:
      return { effort: "none", exclude: true };
  }
}

function safeSend(sender, channel, payload) {
  if (!sender || sender.isDestroyed()) return;
  sender.send(channel, payload);
}

function SendMessage({ messages } = {}, sender) {
  const apiKey = configService.get("apiKey");
  const model = configService.get("model");
  const reasoningLevel = configService.get("reasoning") || "None";
  const reasoningOptions = buildReasoningOptions(reasoningLevel);

  if (!Array.isArray(messages) || messages.length === 0) {
    safeSend(sender, channels.CHAT_ERROR, { message: "No messages to send." });
    return { ok: false };
  }

  aiService.streamChat(
    messages,
    model,
    apiKey,
    reasoningOptions,
    (delta) => safeSend(sender, channels.CHAT_DELTA, { delta }),
    () => safeSend(sender, channels.CHAT_DONE, {}),
    (err) => {
      const message = err?.message || String(err);
      console.error("[chat-middleware] SendMessage: OpenRouter request failed", {
        model,
        reasoningLevel,
        messageCount: messages.length,
        error: message,
      });
      safeSend(sender, channels.CHAT_ERROR, { message });
    },
    (delta) => {
      if (reasoningLevel !== "None") {
        safeSend(sender, channels.CHAT_REASONING_DELTA, { delta });
      }
    }
  );

  return { ok: true };
}

module.exports = { SendMessage };
