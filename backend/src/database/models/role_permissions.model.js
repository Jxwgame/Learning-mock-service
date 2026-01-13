module.exports = (sequelize, DataTypes) => {
  const role_permissions = sequelize.define("role_permissions", {
    role_id: { type: DataTypes.INTEGER, primaryKey: true },
    permission_id: { type: DataTypes.INTEGER, primaryKey: true },
  });
  role_permissions.associate = (db) => {
    role_permissions.belongsTo(db.roles, {
      foreignKey: "role_id",
      onDelete: "CASCADE",
    });
    role_permissions.belongsTo(db.permissions, {
      foreignKey: "permission_id",
      onDelete: "CASCADE",
    });
  };

  return role_permissions;
};
