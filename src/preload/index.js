const { contextBridge, ipcRenderer } = require("electron");

const CH = {
  PING: "oml:ping",
};

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke(CH.PING),
});
