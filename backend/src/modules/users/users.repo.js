const db = require("../../database/models");

const User = db.users;
const Role = db.roles;

async function upsertByGoogle({ google_id, email, first_name, last_name }) {
  let user = await User.findOne({ where: { google_id } });
  if (!user) user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      google_id,
      email,
      first_name,
      last_name,
      is_active: true,
    });

    const learnerRole = await Role.findOne({ where: { role_name: "learner" } });
    if (learnerRole) {
      await db.user_roles.create({
        user_id: user.user_id,
        role_id: learnerRole.role_id,
      });
    }
  } else {
    await user.update({
      google_id,
      email,
      first_name,
      last_name,
    });
  }
  return getByIdWithRoles(user.user_id);
}

async function getById(user_id) {
  const row = await User.findByPk(user_id);
  return row ? row.toJSON() : null;
}

async function getByIdWithRoles(user_id, options = {}) {
  const user = await User.findByPk(user_id, {
    include: [{
      model: Role,
      as: "roles",
      attributes: ["role_id", "role_name"],
      through: { attributes: [] },
    }],
    ...options,
  });

  if (!user) return null;

  const userData = user.toJSON();
  userData.roles = (userData.roles || []).map(r => r.role_name);
  return userData;
}

async function getByGoogleId(google_id) {
  const row = await User.findOne({ where: { google_id } });
  return row ? row.toJSON() : null;
}

async function getByEmail(email) {
  const row = await User.findOne({ where: { email } });
  return row ? row.toJSON() : null;
}

async function update(user_id, data) {
  const user = await User.findByPk(user_id);
  if (!user) return null;
  await user.update(data);
  return user.toJSON();
}

module.exports = {
  upsertByGoogle,
  getById,
  getByIdWithRoles,
  getByGoogleId,
  getByEmail,
  update,
};