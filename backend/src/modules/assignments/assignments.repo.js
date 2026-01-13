const db = require("../../database/models");
const AssignmentModel = db.assignments;

function toPlain(row) {
  return row && typeof row.toJSON === "function" ? row.toJSON() : row;
}

async function getById(assignment_id) {
  return AssignmentModel.findOne({ where: { assignment_id }, raw: true });
}

async function createAssignment({ lesson_id, title, description, due_date, max_score }, options = {}) {
  const row = await AssignmentModel.create({
    lesson_id,
    title,
    description: description || "",
    due_date,
    max_score,
    created_at: new Date(),
    updated_at: new Date(),
  }, options);
  return toPlain(row);
}

async function updateAssignment(assignment_id, patch, options = {}) {
  const row = await AssignmentModel.findOne({ where: { assignment_id }, ...options });
  if (!row) return null;
  await row.update({ ...patch, updated_at: new Date() }, options);
  return toPlain(row);
}

async function deleteAssignment(assignment_id, options = {}) {
  const affected = await AssignmentModel.destroy({ where: { assignment_id }, ...options });
  return affected > 0;
}


// Published list by course/version: join assignments -> lessons to filter version_id
async function listByCourseVersion({ course_id, version_id }) {
  const LessonModel = db.course_lessons || db.CourseLesson;
  const rows = await AssignmentModel.findAll({
    include: [
      {
        model: LessonModel,
        required: true,
        attributes: ["lesson_id", "lesson_title", "course_id", "version_id"],
        where: { course_id, version_id },
      },
    ],
    order: [["assignment_id", "ASC"]],
  });

  return rows.map(toPlain);
}

async function listAll() {
  const LessonModel = db.course_lessons;
  const rows = await AssignmentModel.findAll({
    include: [
      {
        model: LessonModel,
        required: true,
        attributes: ["lesson_id", "lesson_title", "course_id", "version_id"],
      },
    ],
    order: [["assignment_id", "DESC"]],
  });

  return rows.map(toPlain);
}

module.exports = {
  getById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listByCourseVersion,
  listAll,
};
