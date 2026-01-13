module.exports = (sequelize, DataTypes) => {
  const EntityChangeLogs = sequelize.define("entity_change_logs", {
    change_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_user_id: DataTypes.INTEGER,
    entity_type: DataTypes.STRING(50),
    entity_id: DataTypes.INTEGER,
    change_type: DataTypes.STRING(20),
    old_values: DataTypes.JSON,
    new_values: DataTypes.JSON,
    request_id: DataTypes.STRING(64),
    created_at: DataTypes.DATE,
  }, {
    timestamps: false,
  });

  EntityChangeLogs.associate = (models) => {
    EntityChangeLogs.belongsTo(models.users, {
      foreignKey: "actor_user_id",
      as: "actor",
    });
  };

  return EntityChangeLogs;
};
