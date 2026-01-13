const db = require("../../database/models");
const { requireRequestId, assertResult, assertTargetType } = require("./base.guard");
const { assertAuditEventCode } = require("./validators");

async function logAudit({
  actor_user_id,
  event_code,
  target_type,
  target_id,
  result,
  request_id,
  transaction,
}) {
  requireRequestId(request_id);
  assertResult(result);
  assertTargetType(target_type);
  await assertAuditEventCode(event_code);

  try {
    return await db.audit_events.create({
      actor_user_id,
      event_code,
      target_type,
      target_id,
      result,
      request_id,
      created_at: new Date(),
    }, { transaction });
  } catch (e) {
    await db.system_logs.create({
      level: "ERROR",
      source: "audit.logger",
      message: e.message,
      context: { event_code, target_type, target_id },
      created_at: new Date(),
    });
    throw e;
  }
}

module.exports = { logAudit };