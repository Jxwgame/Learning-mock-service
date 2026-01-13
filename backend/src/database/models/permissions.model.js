module.exports = (sequelize, DataTypes) => {
  const permissions = sequelize.define("permissions", {
    permission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    permission_name: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.STRING(100) },
  });

  permissions.associate = (db) => {
    permissions.belongsToMany(db.roles, {
      through: db.role_permissions,
      foreignKey: "permission_id",
      otherKey: "role_id",
    });
  };

  return permissions;
};
