const db = require("../../database/models");
const { Op } = require("sequelize");

const RefreshToken = db.refresh_tokens;

async function create({ user_id, session_id, device_id, token_hash, expires_at }) {
  const row = await RefreshToken.create({
    user_id,
    session_id,
    device_id,
    token_hash,
    issued_at: new Date(),
    expires_at,
    revoked_at: null,
    replaced_by_refresh_id: null,
  });
  return row.toJSON ? row.toJSON() : row;
}

async function findValidByHash(token_hash) {
  const row = await RefreshToken.findOne({
    where: {
      token_hash,
      [Op.or]: [
        { revoked_at: null },
        {
          revoked_at: {
            [Op.gt]: new Date(Date.now() - 10000), // 10 seconds
          },
        },
      ],
      expires_at: { [Op.gt]: new Date() },
    },
    order: [['issued_at', 'DESC']],
  });
  return row ? (row.toJSON ? row.toJSON() : row) : null;
}

async function revoke(refresh_id, { revoked_at = new Date(), replaced_by_refresh_id = null }) {
  const [affected] = await RefreshToken.update(
    {
      revoked_at,
      replaced_by_refresh_id,
    },
    {
      where: {
        refresh_id,
        revoked_at: null,
      },
    }
  );
  return affected > 0;
}

module.exports = { create, findValidByHash, revoke };
