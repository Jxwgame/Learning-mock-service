const db = require("../../database/models");
const { Op } = db.Sequelize || require("sequelize");

const Course = db.courses;

async function existsByNameYear(course_name, year) {
  const row = await Course.findOne({
    where: { course_name, year },
    attributes: ["course_id"],
    raw: true,
  });
  return !!row;
}

async function create({ course_name, description, year, created_by }, options = {}) {
  const row = await Course.create({
    course_name,
    description,
    year,
    created_by,
  }, options);
  return row.toJSON ? row.toJSON() : row;
}

async function update(course_id, patch, options = {}) {
  const [count] = await Course.update(patch, { where: { course_id }, ...options });
  return count > 0;
}

async function getById(course_id, options = {}) {
  return Course.findOne({ where: { course_id }, raw: true, ...options });
}

async function list({ year, q, limit = 20, offset = 0 }) {
  const where = {};
  if (year) where.year = year;
  if (q) {
    where[Op.or] = [
      { course_name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }

  const rows = await Course.findAll({
    where,
    order: [["updated_at", "DESC"]],
    limit,
    offset,
    raw: true,
  });

  return rows;
}

async function getActivePublishedVersionId(course_id) {
  const row = await Course.findOne({
    where: { course_id },
    attributes: ["active_published_version_id"],
    raw: true,
  });
  return row?.active_published_version_id || null;
}

async function deleteCourse(course_id, options = {}) {
  const count = await Course.destroy({ where: { course_id }, ...options });
  return count > 0;
}

module.exports = { existsByNameYear, create, update, getById, list, getActivePublishedVersionId, deleteCourse };