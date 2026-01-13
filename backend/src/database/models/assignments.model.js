module.exports = (sequelize, DataTypes) => {
  const assignments = sequelize.define("assignments", {
    assignment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lesson_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.TEXT },
    due_date: { type: DataTypes.DATE },
    max_score: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  assignments.associate = (db) => {
    assignments.belongsTo(db.course_lessons, { foreignKey: "lesson_id", onDelete: "CASCADE" });
    assignments.hasMany(db.assignment_submissions, { foreignKey: "assignment_id" });
  };

  return assignments;
};
