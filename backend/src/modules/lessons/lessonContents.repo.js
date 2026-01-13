const db = require("../../database/models");
const ContentModel = db.lesson_contents;

function toPlain(row) {
  return row && typeof row.toJSON === "function" ? row.toJSON() : row;
}

async function getById(content_id) {
  return ContentModel.findOne({ where: { content_id }, raw: true });
}

async function listByLesson(lesson_id) {
  return ContentModel.findAll({
    where: { lesson_id },
    order: [["content_id", "ASC"]],
    raw: true,
  });
}

async function createContent({
  lesson_id,
  content_type,
  content_text,
  content_file_url,
  file_type,
}, options = {}) {
  const row = await ContentModel.create({
    lesson_id,
    content_type,
    content_text,
    content_file_url,
    file_type,
    created_at: new Date(),
    updated_at: new Date(),
  }, options);
  return toPlain(row);
}

async function updateContent(content_id, patch, options = {}) {
  const row = await ContentModel.findOne({ where: { content_id }, ...options });
  if (!row) return null;
  await row.update({ ...patch, updated_at: new Date() }, options);
  return toPlain(row);
}

async function deleteContent(content_id, options = {}) {
  const affected = await ContentModel.destroy({ where: { content_id }, ...options });
  return affected > 0;
}

module.exports = {
  getById,
  listByLesson,
  createContent,
  updateContent,
  deleteContent,
};
