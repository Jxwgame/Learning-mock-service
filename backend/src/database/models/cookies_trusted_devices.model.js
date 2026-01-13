module.exports = (sequelize, DataTypes) => {
  const cookies_trusted_devices = sequelize.define("cookies_trusted_devices", {
    trust_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    device_id: { type: DataTypes.STRING(64) },
    cookie_token_hash: { type: DataTypes.STRING(255) },
    trusted_at: { type: DataTypes.DATE },
    expires_at: { type: DataTypes.DATE },
    revoked_at: { type: DataTypes.DATE },
  });

  cookies_trusted_devices.associate = (db) => {
    cookies_trusted_devices.belongsTo(db.users, { foreignKey: "user_id", onDelete: "CASCADE" });
  };

  return cookies_trusted_devices;
};
