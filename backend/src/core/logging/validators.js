const db = require("../../database/models");

async function assertAuditEventCode(event_code) {
  const row = await db.audit_event_types.findOne({
    where: { event_code },
    raw: true,
  });
  if (!row) {
    const err = new Error("INVALID_AUDIT_EVENT_CODE");
    err.status = 500;
    throw err;
  }
}

function sanitizeDiff(oldValues, newValues) {
  if (!oldValues && !newValues) return { old: null, next: null };

  const oldObj = oldValues || {};
  const newObj = newValues || {};

  const diffOld = {};
  const diffNew = {};

  Object.keys({ ...oldObj, ...newObj }).forEach((k) => {
    if (oldObj[k] !== newObj[k]) {
      if (oldObj[k] !== undefined) diffOld[k] = oldObj[k];
      if (newObj[k] !== undefined) diffNew[k] = newObj[k];
    }
  });

  return {
    old: Object.keys(diffOld).length ? diffOld : null,
    next: Object.keys(diffNew).length ? diffNew : null,
  };
}

module.exports = {
  assertAuditEventCode,
  sanitizeDiff,
};