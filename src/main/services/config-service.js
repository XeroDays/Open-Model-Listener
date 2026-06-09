const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let configPath = "";
let store = {};

function resolvePath() {
  if (configPath) return;
  configPath = path.join(app.getPath("userData"), "user-config.json");
}

function load() {
  resolvePath();
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    store = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    store = {};
  }
}

function save() {
  resolvePath();
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[config-service] Failed to save:", err.message);
  }
}

function set(key, value) {
  if (typeof key !== "string" || !key) return;
  load();
  store[key] = value;
  save();
}

function get(key) {
  if (typeof key !== "string" || !key) return null;
  load();
  return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
}

module.exports = { set, get };
