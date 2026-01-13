const db = require("../../database/models");
const { Op } = require("sequelize");

const Trust = db.cookies_trusted_devices;

async function isTrusted({ user_id, device_id, cookie_token_hash }) {
  const row = await Trust.findOne({
    where: {
      user_id,
      device_id,
      cookie_token_hash,
      revoked_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
  });
  return !!row;
}

async function createTrust({ user_id, device_id, cookie_token_hash, expires_at }) {
  await Trust.destroy({
    where: { user_id, device_id }
  });

  const row = await Trust.create({
    user_id,
    device_id,
    cookie_token_hash,
    trusted_at: new Date(),
    expires_at,
    revoked_at: null,
  });

  return row.toJSON ? row.toJSON() : row;
}

async function revokeTrust({ trust_id, revoked_at = new Date() }) {
  const [affected] = await Trust.update(
    { revoked_at },
    {
      where: {
        trust_id,
        revoked_at: null,
      },
    }
  );
  return affected > 0;
}

module.exports = { isTrusted, createTrust, revokeTrust };
