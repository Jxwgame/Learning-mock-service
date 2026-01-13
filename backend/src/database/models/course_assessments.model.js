module.exports = (sequelize, DataTypes) => {
  const course_assessments = sequelize.define("course_assessments", {
    assessment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER },
    version_id: { type: DataTypes.INTEGER },
    assessment_title: { type: DataTypes.STRING(255) },
    assessment_type: { type: DataTypes.STRING(50) },
    time_limit: { type: DataTypes.INTEGER },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    access_code: { type: DataTypes.STRING(50) },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  course_assessments.associate = (db) => {
    course_assessments.belongsTo(db.courses, { foreignKey: "course_id", onDelete: "CASCADE" });
    course_assessments.belongsTo(db.course_versions, { foreignKey: "version_id", onDelete: "CASCADE" });
  };

  return course_assessments;
};
