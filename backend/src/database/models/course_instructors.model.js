module.exports = (sequelize, DataTypes) => {
  const CourseInstructor = sequelize.define(
    "course_instructors",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      course_id: { type: DataTypes.INTEGER, allowNull: false },
      instructor_id: { type: DataTypes.INTEGER, allowNull: false },

      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "owner",
        validate: { isIn: [["owner", "assistant"]] },
      },

      assigned_by: { type: DataTypes.INTEGER, allowNull: true },
      assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
      active_key: { type: DataTypes.TINYINT, allowNull: true },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: "uq_course_instructor_active",
          unique: true,
          fields: ["course_id", "instructor_id", "active_key"],
        },

        { name: "idx_course_instructors_course_revoked", fields: ["course_id", "revoked_at"] },
        { name: "idx_course_instructors_instructor_revoked", fields: ["instructor_id", "revoked_at"] },
        { name: "idx_course_instructors_course_instructor", fields: ["course_id", "instructor_id"] },
      ],
    }
  );

  CourseInstructor.beforeValidate((row) => {
    row.active_key = row.revoked_at ? null : 1;
  });

  CourseInstructor.beforeUpdate((row) => {
    row.active_key = row.revoked_at ? null : 1;
  });

  CourseInstructor.associate = (db) => {
    CourseInstructor.belongsTo(db.courses, { foreignKey: "course_id", onDelete: "CASCADE" });

    CourseInstructor.belongsTo(db.users, {
      foreignKey: "instructor_id",
      as: "instructor",
      onDelete: "CASCADE",
    });

    CourseInstructor.belongsTo(db.users, {
      foreignKey: "assigned_by",
      as: "assignedBy",
      onDelete: "SET NULL",
    });
  };

  return CourseInstructor;
};
