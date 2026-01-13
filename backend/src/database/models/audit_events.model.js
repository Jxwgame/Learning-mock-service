module.exports = (sequelize, DataTypes) => {
  const AuditEvent = sequelize.define("audit_events", {
    audit_event_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_user_id: DataTypes.INTEGER,
    event_code: DataTypes.STRING(100),
    target_type: DataTypes.STRING(50),
    target_id: DataTypes.INTEGER,
    result: DataTypes.STRING(20),
    request_id: DataTypes.STRING(64),
    created_at: DataTypes.DATE,
  }, {
    timestamps: false,
  });

  AuditEvent.associate = (db) => {
    AuditEvent.belongsTo(db.audit_event_types, {
      foreignKey: "event_code",
      targetKey: "event_code",
    });
    AuditEvent.belongsTo(db.users, {
      foreignKey: "actor_user_id",
      as: "user",
    });
  };

  return AuditEvent;
};
