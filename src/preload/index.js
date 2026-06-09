const { contextBridge, ipcRenderer } = require("electron");

const CH = {
  PING: "oml:ping",
  SAVE_CONFIG: "oml:save-config",
  GET_CONFIG: "oml:get-config",
  CHAT_SEND: "oml:chat-send",
  CHAT_DELTA: "oml:chat-delta",
  CHAT_REASONING_DELTA: "oml:chat-reasoning-delta",
  CHAT_DONE: "oml:chat-done",
  CHAT_ERROR: "oml:chat-error",
};

function subscribe(channel, cb) {
  if (typeof cb !== "function") return () => {};
  const handler = (_event, payload) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke(CH.PING),
  saveConfig: (payload) => ipcRenderer.invoke(CH.SAVE_CONFIG, payload),
  getConfig: (key) => ipcRenderer.invoke(CH.GET_CONFIG, key),
  chatSend: (payload) => ipcRenderer.invoke(CH.CHAT_SEND, payload),
  onChatDelta: (cb) => subscribe(CH.CHAT_DELTA, cb),
  onChatReasoningDelta: (cb) => subscribe(CH.CHAT_REASONING_DELTA, cb),
  onChatDone: (cb) => subscribe(CH.CHAT_DONE, cb),
  onChatError: (cb) => subscribe(CH.CHAT_ERROR, cb),
});
