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

const REASONING_UI_FLUSH_MS = 150;
const REASONING_MATH_MAX_CHARS = 12000;
const CONTENT_UI_FLUSH_MS = 50;

let reasoningPending = "";
let reasoningFlushTimer = null;
let contentPending = "";
let contentFlushTimer = null;

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
        if (reasoningPending) {
          streamedReasoning += reasoningPending;
          reasoningPending = "";
        }
        thinkingBody.textContent = streamedReasoning;
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
  const charCount = streamedReasoning.length + reasoningPending.length;
  if (!contentStarted) {
    aiBlock.thinkingLabel.textContent = `Thinking\u2026 (${charCount.toLocaleString()} chars)`;
    return;
  }
  if (charCount > 0) {
    aiBlock.thinkingLabel.textContent = `See thinking (${charCount.toLocaleString()} chars)`;
  }
}

function syncThinkingBody(aiBlock) {
  if (!aiBlock?.thinkingBody) return;
  if (!aiBlock.thinkingPanel?.classList.contains("is-open")) return;
  aiBlock.thinkingBody.textContent = streamedReasoning;
  aiBlock.thinkingBody.scrollTop = aiBlock.thinkingBody.scrollHeight;
}

function flushReasoningUI() {
  reasoningFlushTimer = null;
  if (!currentAiBlock || !reasoningPending) return;

  streamedReasoning += reasoningPending;
  reasoningPending = "";

  if (currentAiBlock.thinkingPanel) {
    currentAiBlock.thinkingPanel.hidden = false;
    if (!contentStarted) {
      currentAiBlock.thinkingPanel.classList.add("is-streaming");
    }
  }

  updateThinkingLabel(currentAiBlock);
  syncThinkingBody(currentAiBlock);
}

function scheduleReasoningUI() {
  if (reasoningFlushTimer) return;
  reasoningFlushTimer = setTimeout(flushReasoningUI, REASONING_UI_FLUSH_MS);
}

function flushContentUI() {
  contentFlushTimer = null;
  if (!currentAiBlock || !contentPending) return;

  streamedContent += contentPending;
  contentPending = "";
  currentAiBlock.responseBubble.textContent = streamedContent;
  scrollToBottom();
}

function scheduleContentUI() {
  if (contentFlushTimer) return;
  contentFlushTimer = setTimeout(flushContentUI, CONTENT_UI_FLUSH_MS);
}

function flushPendingStreamUI() {
  if (reasoningFlushTimer) {
    clearTimeout(reasoningFlushTimer);
    reasoningFlushTimer = null;
  }
  if (contentFlushTimer) {
    clearTimeout(contentFlushTimer);
    contentFlushTimer = null;
  }
  if (reasoningPending) {
    streamedReasoning += reasoningPending;
    reasoningPending = "";
  }
  if (contentPending) {
    streamedContent += contentPending;
    contentPending = "";
  }
}

function setStreaming(streaming) {
  isStreaming = streaming;
  sendBtn.disabled = streaming;
  inputEl.disabled = streaming;
}

function resetTurnState() {
  flushPendingStreamUI();
  currentAiBlock = null;
  streamedContent = "";
  streamedReasoning = "";
  contentStarted = false;
  reasoningPending = "";
  contentPending = "";
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

    reasoningPending += delta;

    if (currentAiBlock.thinkingPanel) {
      currentAiBlock.thinkingPanel.hidden = false;
    }

    scheduleReasoningUI();
  });

  unsubDelta = window.electronAPI?.onChatDelta?.(({ delta } = {}) => {
    if (!currentAiBlock || !delta) return;

    if (!contentStarted) {
      flushPendingStreamUI();
      contentStarted = true;
      if (currentAiBlock.thinkingPanel) {
        currentAiBlock.thinkingPanel.classList.remove("is-streaming");
        currentAiBlock.thinkingPanel.classList.remove("is-open");
        currentAiBlock.thinkingToggle?.setAttribute("aria-expanded", "false");
      }
      updateThinkingLabel(currentAiBlock);
      if (currentAiBlock.thinkingBody && streamedReasoning) {
        currentAiBlock.thinkingBody.textContent = streamedReasoning;
      }
    }

    contentPending += delta;
    scheduleContentUI();
  });

  unsubDone = window.electronAPI?.onChatDone?.(() => {
    flushPendingStreamUI();

    const finishedBlock = currentAiBlock;
    const finalContent = streamedContent;
    const finalReasoning = streamedReasoning;

    if (showThinkingPanel && finishedBlock?.thinkingPanel) {
      finishedBlock.thinkingPanel.classList.remove("is-streaming");
      if (finalReasoning.length === 0) {
        finishedBlock.thinkingPanel.hidden = true;
      } else {
        updateThinkingLabel(finishedBlock);
        if (finishedBlock.thinkingPanel.classList.contains("is-open")) {
          if (finalReasoning.length > REASONING_MATH_MAX_CHARS) {
            finishedBlock.thinkingBody.textContent = finalReasoning;
          } else {
            renderMathOnly(finishedBlock.thinkingBody, finalReasoning);
          }
        } else {
          finishedBlock.thinkingBody.textContent = "";
        }
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

  reasoningPending = "";
  contentPending = "";
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
