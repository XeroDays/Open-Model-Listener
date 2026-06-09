import { renderRichContent, renderMathOnly } from "./rich-render.js";

const messagesEl = document.getElementById("chat-messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("btn-send");
const backBtn = document.getElementById("btn-back");

const messages = [];
let isStreaming = false;
let showThinkingPanel = false;
let currentAiBlock = null;
let streamedContent = "";
let streamedReasoning = "";
let contentStarted = false;
let unsubDelta = null;
let unsubReasoningDelta = null;
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

async function refreshReasoningSetting() {
  const level = await window.electronAPI?.getConfig?.("reasoning");
  showThinkingPanel = Boolean(level && level !== "None");
}

function createAiMessageBlock() {
  const block = document.createElement("div");
  block.className = "msg-ai-block";

  let thinkingPanel = null;
  let thinkingToggle = null;
  let thinkingLabel = null;
  let thinkingBody = null;

  if (showThinkingPanel) {
    thinkingPanel = document.createElement("div");
    thinkingPanel.className = "msg-thinking-panel";
    thinkingPanel.hidden = true;

    thinkingToggle = document.createElement("button");
    thinkingToggle.type = "button";
    thinkingToggle.className = "msg-thinking-toggle";
    thinkingToggle.setAttribute("aria-expanded", "false");

    const thinkingChevron = document.createElement("span");
    thinkingChevron.className = "msg-thinking-chevron";
    thinkingChevron.setAttribute("aria-hidden", "true");
    thinkingChevron.textContent = "\u25B8";

    thinkingLabel = document.createElement("span");
    thinkingLabel.className = "msg-thinking-toggle-label";
    thinkingLabel.textContent = "Thinking\u2026";

    thinkingToggle.append(thinkingChevron, thinkingLabel);

    thinkingBody = document.createElement("pre");
    thinkingBody.className = "msg-thinking-body";

    thinkingPanel.append(thinkingToggle, thinkingBody);

    thinkingToggle.addEventListener("click", () => {
      const isOpen = thinkingPanel.classList.toggle("is-open");
      thinkingToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        thinkingBody.scrollTop = thinkingBody.scrollHeight;
      }
    });
  }

  const responseBubble = document.createElement("div");
  responseBubble.className = "msg msg-ai";

  if (thinkingPanel) {
    block.append(thinkingPanel, responseBubble);
  } else {
    block.append(responseBubble);
  }

  messagesEl.appendChild(block);
  scrollToBottom();

  return {
    block,
    thinkingPanel,
    thinkingToggle,
    thinkingLabel,
    thinkingBody,
    responseBubble,
  };
}

function updateThinkingLabel(aiBlock) {
  if (!aiBlock?.thinkingLabel) return;
  if (!contentStarted) {
    aiBlock.thinkingLabel.textContent = `Thinking\u2026 (${streamedReasoning.length} chars)`;
    return;
  }
  if (streamedReasoning.length > 0) {
    aiBlock.thinkingLabel.textContent = `See thinking (${streamedReasoning.length} chars)`;
  }
}

function setStreaming(streaming) {
  isStreaming = streaming;
  sendBtn.disabled = streaming;
  inputEl.disabled = streaming;
}

function resetTurnState() {
  currentAiBlock = null;
  streamedContent = "";
  streamedReasoning = "";
  contentStarted = false;
}

function removeCurrentAiBlock() {
  if (currentAiBlock?.block) {
    currentAiBlock.block.remove();
  }
  resetTurnState();
}

function setupListeners() {
  unsubReasoningDelta = window.electronAPI?.onChatReasoningDelta?.(({ delta } = {}) => {
    if (!showThinkingPanel || !currentAiBlock || !delta) return;

    streamedReasoning += delta;

    if (currentAiBlock.thinkingPanel) {
      currentAiBlock.thinkingPanel.hidden = false;
      if (!contentStarted) {
        currentAiBlock.thinkingPanel.classList.add("is-streaming");
      }
    }
    if (currentAiBlock.thinkingBody) {
      currentAiBlock.thinkingBody.textContent = streamedReasoning;
      if (currentAiBlock.thinkingPanel?.classList.contains("is-open")) {
        currentAiBlock.thinkingBody.scrollTop = currentAiBlock.thinkingBody.scrollHeight;
      }
    }
    updateThinkingLabel(currentAiBlock);
    scrollToBottom();
  });

  unsubDelta = window.electronAPI?.onChatDelta?.(({ delta } = {}) => {
    if (!currentAiBlock || !delta) return;

    if (!contentStarted) {
      contentStarted = true;
      if (currentAiBlock.thinkingPanel) {
        currentAiBlock.thinkingPanel.classList.remove("is-streaming");
        currentAiBlock.thinkingPanel.classList.remove("is-open");
        currentAiBlock.thinkingToggle?.setAttribute("aria-expanded", "false");
      }
      updateThinkingLabel(currentAiBlock);
    }

    streamedContent += delta;
    currentAiBlock.responseBubble.textContent = streamedContent;
    scrollToBottom();
  });

  unsubDone = window.electronAPI?.onChatDone?.(() => {
    const finishedBlock = currentAiBlock;
    const finalContent = streamedContent;
    const finalReasoning = streamedReasoning;

    if (showThinkingPanel && finishedBlock?.thinkingPanel) {
      finishedBlock.thinkingPanel.classList.remove("is-streaming");
      if (finalReasoning.length === 0) {
        finishedBlock.thinkingPanel.hidden = true;
      } else {
        updateThinkingLabel(finishedBlock);
        renderMathOnly(finishedBlock.thinkingBody, finalReasoning);
      }
    }

    if (finalContent) {
      renderRichContent(finishedBlock?.responseBubble, finalContent);
      messages.push({ role: "assistant", content: finalContent });
    }

    resetTurnState();
    setStreaming(false);
  });

  unsubError = window.electronAPI?.onChatError?.(({ message } = {}) => {
    removeCurrentAiBlock();
    createBubble("error", message || "An error occurred.");
    setStreaming(false);
  });
}

function teardownListeners() {
  unsubDelta?.();
  unsubReasoningDelta?.();
  unsubDone?.();
  unsubError?.();
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isStreaming) return;

  inputEl.value = "";
  createBubble("user", text);
  messages.push({ role: "user", content: text });

  await refreshReasoningSetting();

  streamedContent = "";
  streamedReasoning = "";
  contentStarted = false;
  currentAiBlock = createAiMessageBlock();
  setStreaming(true);

  try {
    await window.electronAPI.chatSend({ messages: [...messages] });
  } catch (err) {
    removeCurrentAiBlock();
    messages.pop();
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

  await refreshReasoningSetting();
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
