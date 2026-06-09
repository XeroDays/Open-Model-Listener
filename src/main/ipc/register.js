const { ipcMain } = require("electron");
const channels = require("../../shared/ipc/channels");
const { Ping } = require("../middlewares/app-middleware");
const { SaveConfig, GetConfig } = require("../middlewares/config-middleware");
const { SendMessage } = require("../middlewares/chat-middleware");

function registerIpcHandlers() {
  ipcMain.handle(channels.PING, async () => Ping());

  ipcMain.handle(channels.SAVE_CONFIG, async (_event, payload) =>
    SaveConfig(payload || {})
  );

  ipcMain.handle(channels.GET_CONFIG, async (_event, key) => GetConfig(key));

  ipcMain.handle(channels.CHAT_SEND, async (event, payload) =>
    SendMessage(payload || {}, event.sender)
  );
}

module.exports = { registerIpcHandlers };
