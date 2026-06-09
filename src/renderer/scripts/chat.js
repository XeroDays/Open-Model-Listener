const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("btn-send");
const backBtn = document.getElementById("btn-back");

const messages = [];
let isStreaming = false;
let currentAiBubble = null;
let streamedContent = "";
let unsubDelta = null;
let unsubDone = null;
let unsubError = null;

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createBubble(role, content = "") {
  const bubble = document.createElement("div");
  bubble.className = `msg msg-${role}`;
  bubble.textContent = content;
  messagesEl.appendChild(bubble);
  scrollToBottom();
  return bubble;
}

function setStreaming(streaming) {
  isStreaming = streaming;
  sendBtn.disabled = streaming;
  inputEl.disabled = streaming;
}

function setupListeners() {
  unsubDelta = window.electronAPI?.onChatDelta?.(({ delta } = {}) => {
    if (!currentAiBubble || !delta) return;
    streamedContent += delta;
    currentAiBubble.textContent = streamedContent;
    scrollToBottom();
  });

  unsubDone = window.electronAPI?.onChatDone?.(() => {
    if (streamedContent) {
      messages.push({ role: "assistant", content: streamedContent });
    }
    streamedContent = "";
    currentAiBubble = null;
    setStreaming(false);
  });

  unsubError = window.electronAPI?.onChatError?.(({ message } = {}) => {
    if (currentAiBubble) {
      currentAiBubble.remove();
      currentAiBubble = null;
    }
    streamedContent = "";
    createBubble("error", message || "An error occurred.");
    setStreaming(false);
  });
}

function teardownListeners() {
  unsubDelta?.();
  unsubDone?.();
  unsubError?.();
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isStreaming) return;

  inputEl.value = "";
  createBubble("user", text);
  messages.push({ role: "user", content: text });

  streamedContent = "";
  currentAiBubble = createBubble("ai", "");
  setStreaming(true);

  try {
    await window.electronAPI.chatSend({ messages: [...messages] });
  } catch (err) {
    if (currentAiBubble) {
      currentAiBubble.remove();
      currentAiBubble = null;
    }
    messages.pop();
    streamedContent = "";
    createBubble("error", err?.message || "Failed to send message.");
    setStreaming(false);
  }
}

async function init() {
  const apiKey = await window.electronAPI?.getConfig?.("apiKey");
  if (!apiKey) {
    window.location.href = "../../index.html";
    return;
  }

  setupListeners();
}

backBtn?.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

sendBtn?.addEventListener("click", sendMessage);

inputEl?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    sendMessage();
  }
});

window.addEventListener("beforeunload", teardownListeners);

document.addEventListener("DOMContentLoaded", init);
