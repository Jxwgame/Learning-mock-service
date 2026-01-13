const db = require("../../database/models");
const {
  requireRequestId,
  assertEntityType,
  assertChangeType,
} = require("./base.guard");
const { sanitizeDiff } = require("./validators");

async function logEntityChange({
  actor_user_id,
  entity_type,
  entity_id,
  change_type,
  old_values,
  new_values,
  request_id,
  transaction,
}) {
  requireRequestId(request_id);
  assertEntityType(entity_type);
  assertChangeType(change_type);

  const { old, next } = sanitizeDiff(old_values, new_values);

  try {
    return await db.entity_change_logs.create({
      actor_user_id,
      entity_type,
      entity_id,
      change_type,
      old_values: old,
      new_values: next,
      request_id,
      created_at: new Date(),
    }, { transaction });
  } catch (e) {
    await db.system_logs.create({
      level: "ERROR",
      source: "entityChange.logger",
      message: e.message,
      context: { entity_type, entity_id, change_type },
      created_at: new Date(),
    });
    throw e;
  }
}

module.exports = { logEntityChange };
