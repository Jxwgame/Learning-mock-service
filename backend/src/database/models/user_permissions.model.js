module.exports = (sequelize, DataTypes) => {
    const user_permissions = sequelize.define("user_permissions", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        permission_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "If true, this permission is explicitly denied for this user",
        },
        assigned_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        assigned_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "user_permissions",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "permission_id"],
                name: "uq_user_permission",
            },
        ],
    });

    user_permissions.associate = (db) => {
        user_permissions.belongsTo(db.users, {
            foreignKey: "user_id",
            as: "user",
            onDelete: "CASCADE",
        });
        user_permissions.belongsTo(db.permissions, {
            foreignKey: "permission_id",
            as: "permission",
            onDelete: "CASCADE",
        });
        user_permissions.belongsTo(db.users, {
            foreignKey: "assigned_by",
            as: "assigner",
            onDelete: "SET NULL",
        });
    };

    return user_permissions;
};
