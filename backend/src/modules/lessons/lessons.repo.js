const db = require("../../database/models");
const LessonModel = db.course_lessons;

function toPlain(row) {
  return row && typeof row.toJSON === "function" ? row.toJSON() : row;
}

async function listByCourseVersion({ course_id, version_id }) {
  return LessonModel.findAll({
    where: { course_id, version_id },
    order: [["lesson_id", "ASC"]],
    raw: true,
  });
}

async function getLessonById(lesson_id) {
  return LessonModel.findOne({ where: { lesson_id }, raw: true });
}

async function createLesson({ course_id, version_id, lesson_title, lesson_content }, options = {}) {
  const row = await LessonModel.create({
    course_id,
    version_id,
    lesson_title,
    lesson_content: lesson_content || "",
    created_at: new Date(),
    updated_at: new Date(),
  }, options);
  return toPlain(row);
}

async function updateLesson(lesson_id, patch, options = {}) {
  const row = await LessonModel.findOne({ where: { lesson_id }, ...options });
  if (!row) return null;
  await row.update({ ...patch, updated_at: new Date() }, options);
  return toPlain(row);
}

async function deleteLesson(lesson_id, options = {}) {
  const affected = await LessonModel.destroy({ where: { lesson_id }, ...options });
  return affected > 0;
}

module.exports = {
  listByCourseVersion,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
