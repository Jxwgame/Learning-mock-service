module.exports = (sequelize, DataTypes) => {
  const user_roles = sequelize.define("user_roles", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    role_id: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    tableName: "user_roles",
    timestamps: false,
  });

  user_roles.associate = (db) => {
    user_roles.belongsTo(db.users, { foreignKey: "user_id", onDelete: "CASCADE" });
    user_roles.belongsTo(db.roles, { foreignKey: "role_id", onDelete: "CASCADE" });
  };

  return user_roles;
};
