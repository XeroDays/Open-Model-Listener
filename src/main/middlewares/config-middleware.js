const configService = require("../services/config-service");

function SaveConfig({ apiKey, model, reasoning } = {}) {
  if (typeof apiKey === "string") configService.set("apiKey", apiKey);
  if (typeof model === "string") configService.set("model", model);
  if (typeof reasoning === "string") configService.set("reasoning", reasoning);
  return { ok: true };
}

function GetConfig(key) {
  return configService.get(key);
}

module.exports = { SaveConfig, GetConfig };
