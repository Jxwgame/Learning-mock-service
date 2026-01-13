const { logAudit } = require("./audit.logger");
const { logEntityChange } = require("./entityChange.logger");
const { logSystem } = require("./system.logger");

module.exports = {
  logAudit,
  logEntityChange,
  logSystem,
};