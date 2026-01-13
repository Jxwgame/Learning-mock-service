module.exports = (sequelize, DataTypes) => {
  const refresh_tokens = sequelize.define("refresh_tokens", {
    refresh_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    session_id: { type: DataTypes.INTEGER },
    device_id: { type: DataTypes.STRING(64) },
    token_hash: { type: DataTypes.STRING(255) },
    issued_at: { type: DataTypes.DATE },
    expires_at: { type: DataTypes.DATE },
    revoked_at: { type: DataTypes.DATE },
    replaced_by_refresh_id: { type: DataTypes.INTEGER },
  });

  refresh_tokens.associate = (db) => {
    refresh_tokens.belongsTo(db.users, { foreignKey: "user_id", onDelete: "CASCADE" });
    refresh_tokens.belongsTo(db.sessions, { foreignKey: "session_id", onDelete: "CASCADE" });

    refresh_tokens.belongsTo(db.refresh_tokens, {
      foreignKey: "replaced_by_refresh_id",
      as: "replacedBy",
    });
  };

  return refresh_tokens;
};
