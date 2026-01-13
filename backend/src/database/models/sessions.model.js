module.exports = (sequelize, DataTypes) => {
  const sessions = sequelize.define("sessions", {
    session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER },
    device_id: { type: DataTypes.STRING(64) },
    session_token_hash: { type: DataTypes.STRING(255) },
    created_at: { type: DataTypes.DATE },
    last_seen_at: { type: DataTypes.DATE },
    expired_at: { type: DataTypes.DATE },
    revoked_at: { type: DataTypes.DATE },
  }, {
    tableName: "sessions",
    timestamps: false,
  });

  sessions.associate = (db) => {
    sessions.belongsTo(db.users, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    sessions.hasMany(db.refresh_tokens, { foreignKey: "session_id" });
  };
  return sessions;
};
