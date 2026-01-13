const db = require("../../../database/models");

const LEVELS = new Set(["INFO", "WARN", "ERROR"]);

async function logSystem({
  level = "INFO",
  source,
  message,
  context = null,
}) {
  if (!LEVELS.has(level) || !source || !message) {
    const err = new Error("INVALID_SYSTEM_LOG_INPUT");
    err.status = 500;
    throw err;
  }

  return db.system_logs.create({
    level,
    source,
    message,
    context,
    created_at: new Date(),
  });
}

module.exports = { logSystem };