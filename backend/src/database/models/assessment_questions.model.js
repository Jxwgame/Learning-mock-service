module.exports = (sequelize, DataTypes) => {
  const assessment_questions = sequelize.define("assessment_questions", {
    question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assessment_id: { type: DataTypes.INTEGER },
    question_text: { type: DataTypes.TEXT },
    question_type: { type: DataTypes.STRING(50) },
    options: { type: DataTypes.TEXT },
    correct_answer: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  assessment_questions.associate = (db) => {
    assessment_questions.belongsTo(db.course_assessments, { foreignKey: "assessment_id", onDelete: "CASCADE" });
    assessment_questions.hasMany(db.question_options, { foreignKey: "question_id" });
    assessment_questions.hasMany(db.assessment_answers, { foreignKey: "question_id" });
  };

  return assessment_questions;
};
