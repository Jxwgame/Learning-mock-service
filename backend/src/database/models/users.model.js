module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      google_id: {
        type: DataTypes.STRING(100),
        unique: "uq_users_google_id",
      },
      email: {
        type: DataTypes.STRING(100),
        unique: "uq_users_email",
      },
      role_id: {
        type: DataTypes.INTEGER,
      },
      first_name: {
        type: DataTypes.STRING(100),
      },
      last_name: {
        type: DataTypes.STRING(100),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
      created_at: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: false,
    }
  );

  users.associate = (db) => {
    users.belongsToMany(db.roles, {
      through: db.user_roles,
      foreignKey: "user_id",
      otherKey: "role_id",
      as: "roles",
    });
  };

  return users;
};
