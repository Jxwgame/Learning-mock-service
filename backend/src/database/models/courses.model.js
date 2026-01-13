module.exports = (sequelize, DataTypes) => {
  const courses = sequelize.define("courses", {
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_name: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.TEXT },
    year: { type: DataTypes.INTEGER },
    cover_image_url: { type: DataTypes.STRING(500) },
    created_by: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    active_published_version_id: { type: DataTypes.INTEGER },
  });

  courses.associate = (db) => {
    courses.hasMany(db.course_instructors, {
      foreignKey: "course_id",
      as: "instructorLinks",
    });

    courses.belongsToMany(db.users, {
      through: db.course_instructors,
      foreignKey: "course_id",
      otherKey: "instructor_id",
      as: "instructors",
    });
    courses.hasMany(db.course_versions, { foreignKey: "course_id" });
    courses.hasMany(db.course_lessons, { foreignKey: "course_id" });
    courses.hasMany(db.course_assessments, { foreignKey: "course_id" });
    courses.hasMany(db.enrollments, { foreignKey: "course_id" });
  };

  return courses;
};
