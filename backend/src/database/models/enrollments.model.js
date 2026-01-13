module.exports = (sequelize, DataTypes) => {
  const enrollments = sequelize.define("enrollments", {
    enrollment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    course_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING(20) },
    enrolled_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
  });

  enrollments.associate = (db) => {
    enrollments.belongsTo(db.users, { foreignKey: "user_id", onDelete: "CASCADE" });
    enrollments.belongsTo(db.courses, { foreignKey: "course_id", onDelete: "CASCADE" });
  };

  return enrollments;
};
