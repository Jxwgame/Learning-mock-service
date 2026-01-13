module.exports = (sequelize, DataTypes) => {
  const course_versions = sequelize.define("course_versions", {
    version_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER },
    version_number: { type: DataTypes.INTEGER },
    instructor_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING(20) }, // Draft, Published, Archived
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  });

  course_versions.associate = (db) => {
    course_versions.belongsTo(db.courses, { foreignKey: "course_id", onDelete: "CASCADE" });
    course_versions.belongsTo(db.users, { foreignKey: "instructor_id", onDelete: "SET NULL" });

    course_versions.hasMany(db.course_lessons, { foreignKey: "version_id" });
    course_versions.hasMany(db.course_assessments, { foreignKey: "version_id" });
  };

  return course_versions;
};
