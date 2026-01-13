module.exports = (sequelize, DataTypes) => {
  return sequelize.define("audit_event_types", {
    event_code: {
      type: DataTypes.STRING(100),
      primaryKey: true,
    },
    category: DataTypes.STRING(50),
    severity: DataTypes.STRING(20),
    description: DataTypes.STRING(255),
  }, {
    timestamps: false,
  });
};
