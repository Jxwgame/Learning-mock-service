module.exports = (sequelize, DataTypes) => {
  const assignment_submissions = sequelize.define("assignment_submissions", {
    submission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assignment_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    submission_date: { type: DataTypes.DATE },
    grade: { type: DataTypes.FLOAT },
    status: {
      type: DataTypes.ENUM('submitted', 'graded'),
      defaultValue: 'submitted'
    },
    file_url: { type: DataTypes.STRING(255) },
    comments: { type: DataTypes.TEXT }, // Student comments
    feedback: { type: DataTypes.TEXT }, // Instructor feedback
    graded_by: { type: DataTypes.INTEGER },
    graded_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  assignment_submissions.associate = (db) => {
    assignment_submissions.belongsTo(db.assignments, { foreignKey: "assignment_id", onDelete: "CASCADE" });
    assignment_submissions.belongsTo(db.users, { foreignKey: "user_id", onDelete: "CASCADE" });
  };

  return assignment_submissions;
};
