module.exports = (sequelize, DataTypes) => {
  const roles = sequelize.define("roles", {
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role_name: { type: DataTypes.STRING(50) },
    description: { type: DataTypes.STRING(100) },
  }, {
    tableName: "roles",
    timestamps: false,
  });

  roles.associate = (db) => {
    roles.belongsToMany(db.users, {
      through: db.user_roles,
      foreignKey: "role_id",
      otherKey: "user_id",
    });

    roles.belongsToMany(db.permissions, {
      through: db.role_permissions,
      foreignKey: "role_id",
      otherKey: "permission_id",
    });
  };

  return roles;
};
