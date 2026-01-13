module.exports = (sequelize, DataTypes) => {
  const course_lessons = sequelize.define("course_lessons", {
    lesson_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER },
    version_id: { type: DataTypes.INTEGER },
    lesson_title: { type: DataTypes.STRING(255) },
    lesson_content: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  course_lessons.associate = (db) => {
    course_lessons.belongsTo(db.courses, { foreignKey: "course_id", onDelete: "CASCADE" });
    course_lessons.belongsTo(db.course_versions, { foreignKey: "version_id", onDelete: "CASCADE" });

    course_lessons.hasMany(db.lesson_contents, { foreignKey: "lesson_id" });
    course_lessons.hasMany(db.assignments, { foreignKey: "lesson_id" });
  };

  return course_lessons;
};
