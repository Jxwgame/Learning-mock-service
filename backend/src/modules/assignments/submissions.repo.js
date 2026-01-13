const db = require("../../database/models");
const SubmissionModel = db.assignment_submissions;

function toPlain(row) {
  return row && typeof row.toJSON === "function" ? row.toJSON() : row;
}

async function getById(submission_id) {
  return SubmissionModel.findOne({ where: { submission_id }, raw: true });
}

async function createSubmission({ assignment_id, user_id, submission_date, file_url, comments }, options = {}) {
  const row = await SubmissionModel.create({
    assignment_id,
    user_id,
    submission_date,
    file_url,
    comments,
    created_at: new Date(),
    updated_at: new Date(),
  }, options);
  return toPlain(row);
}

async function listByAssignmentAndUser({ assignment_id, user_id }) {
  return SubmissionModel.findAll({
    where: { assignment_id, user_id },
    include: [
      {
        model: db.users,
        attributes: ["first_name", "last_name", "email"],
      },
    ],
    order: [["submission_id", "DESC"]],
  });
}

async function listByAssignment({ assignment_id }) {
  return SubmissionModel.findAll({
    where: { assignment_id },
    include: [
      {
        model: db.users,
        attributes: ["first_name", "last_name", "email"],
      },
    ],
    order: [["submission_id", "DESC"]],
  });
}

async function gradeSubmission(submission_id, patch, options = {}) {
  const row = await SubmissionModel.findOne({ where: { submission_id }, ...options });
  if (!row) return null;
  await row.update({ ...patch }, options);
  return toPlain(row);
}

module.exports = {
  getById,
  createSubmission,
  listByAssignmentAndUser,
  listByAssignment,
  gradeSubmission,
};
