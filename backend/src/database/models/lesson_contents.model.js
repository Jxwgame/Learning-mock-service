module.exports = (sequelize, DataTypes) => {
  const lesson_contents = sequelize.define("lesson_contents", {
    content_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lesson_id: { type: DataTypes.INTEGER },
    content_type: { type: DataTypes.STRING(50) },
    content_text: { type: DataTypes.TEXT },
    content_file_url: { type: DataTypes.STRING(255) },
    file_type: { type: DataTypes.STRING(50) },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  lesson_contents.associate = (db) => {
    lesson_contents.belongsTo(db.course_lessons, { foreignKey: "lesson_id", onDelete: "CASCADE" });
  };

  return lesson_contents;
};
