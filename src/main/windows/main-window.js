const { BrowserWindow } = require("electron");
const path = require("path");

const WINDOW_ICON =
  process.platform === "win32"
    ? path.join(__dirname, "../../../build/icon.ico")
    : path.join(__dirname, "../../renderer/assets/logo/Application logo.png");

function createMainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: WINDOW_ICON,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "../../renderer/index.html"));

  win.once("ready-to-show", () => {
    win.show();
  });

  return win;
}

module.exports = { createMainWindow };
