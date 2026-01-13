module.exports = (sequelize, DataTypes) => {
  return sequelize.define("system_logs", {
    system_log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    level: DataTypes.STRING(10),
    source: DataTypes.STRING(50),
    message: DataTypes.STRING(255),
    context: DataTypes.JSON,
    created_at: DataTypes.DATE,
  }, {
    timestamps: false,
  });
};
