const { ipcMain } = require("electron");
const channels = require("../../shared/ipc/channels");
const { Ping } = require("../middlewares/app-middleware");

function registerIpcHandlers() {
  ipcMain.handle(channels.PING, async () => Ping());
}

module.exports = { registerIpcHandlers };
