const db = require("../../database/models");
const { Op } = require("sequelize");

const Session = db.sessions;

async function create({ user_id, device_id, session_token_hash, expired_at }) {
  const row = await Session.create({
    user_id,
    device_id,
    session_token_hash,
    expired_at,
    created_at: new Date(),
    last_seen_at: new Date(),
    revoked_at: null,
  });
  return row.toJSON ? row.toJSON() : row;
}

async function findValidByTokenHash(session_token_hash) {
  const row = await Session.findOne({
    where: {
      session_token_hash,
      revoked_at: null,
      expired_at: { [Op.gt]: new Date() },
    },
  });
  return row ? (row.toJSON ? row.toJSON() : row) : null;
}

async function findValidBySessionId(session_id) {
  const row = await Session.findOne({
    where: {
      session_id,
      revoked_at: null,
      expired_at: { [Op.gt]: new Date() },
    },
    raw: true,
  });
  return row || null;
}

async function findAllValidByUserId(user_id) {
  const rows = await Session.findAll({
    where: {
      user_id,
      revoked_at: null,
      expired_at: { [Op.gt]: new Date() },
    },
    raw: true,
  });
  return rows || [];
}

async function revoke(session_id) {
  const [affected] = await Session.update(
    { revoked_at: new Date() },
    { where: { session_id, revoked_at: null } }
  );
  return affected > 0;
}

async function touch(session_id) {
  await Session.update(
    { last_seen_at: new Date() },
    { where: { session_id } }
  );
}

module.exports = {
  create,
  findValidByTokenHash,
  findValidBySessionId,
  findAllValidByUserId,
  revoke,
  touch,
};
