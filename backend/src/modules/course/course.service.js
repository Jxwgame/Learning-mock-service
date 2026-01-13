const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const repo = require("./course.repo");
const { logCreateCourse, logUpdateCourse, logDeleteCourse } = require("../../core/logging/composite/course.logger");

function cleanStr(x) {
  return String(x || "").trim();
}

async function createCourse({ actor_user_id, payload, request_id }) {
  const course_name = cleanStr(payload.course_name);
  const description = payload.description ? String(payload.description) : null;
  const year = Number(payload.year);

  if (!course_name)
    throw new AppError("COURSE_NAME_REQUIRED", 400);
  if (!Number.isInteger(year) || year < 2000 || year > 2100)
    throw new AppError("YEAR_INVALID", 400);

  // Check existence (Read outside transaction for performance, or can be inside if needed)
  const exists = await repo.existsByNameYear(course_name, year);
  if (exists)
    throw new AppError("COURSE_ALREADY_EXISTS", 409, "COURSE_ALREADY_EXISTS");

  return db.sequelize.transaction(async (t) => {
    const course = await repo.create({
      course_name,
      description,
      year,
      created_by: actor_user_id,
    }, { transaction: t });

    await logCreateCourse({
      actor_user_id,
      course_id: course.course_id,
      new_values: {
        course_name: course.course_name,
        description: course.description,
        year: course.year,
      },
      request_id,
      transaction: t,
    });

    return course;
  });
}

async function updateCourse({ actor_user_id, course_id, payload, request_id }) {
  if (!Number.isInteger(course_id) || course_id <= 0)
    throw new AppError("COURSE_ID_INVALID", 400);

  const before = await repo.getById(course_id);
  if (!before)
    throw new AppError("COURSE_NOT_FOUND", 404);

  const patch = {};
  if (payload.course_name !== undefined)
    patch.course_name = cleanStr(payload.course_name);
  if (payload.description !== undefined)
    patch.description = payload.description
      ? String(payload.description)
      : null;
  if (payload.year !== undefined) patch.year = Number(payload.year);
  if (payload.cover_image_url !== undefined)
    patch.cover_image_url = payload.cover_image_url;

  if (patch.course_name !== undefined && !patch.course_name)
    throw new AppError("COURSE_NAME_REQUIRED", 400);
  if (
    patch.year !== undefined &&
    (!Number.isInteger(patch.year) || patch.year < 2000 || patch.year > 2100)
  )
    throw new AppError("YEAR_INVALID", 400);

  return db.sequelize.transaction(async (t) => {
    await repo.update(course_id, patch, { transaction: t });

    const after = await repo.getById(course_id, { transaction: t });
    if (!after) throw new AppError("COURSE_NOT_FOUND", 404);

    const old_values = {};
    const new_values = {};
    ["course_name", "description", "year"].forEach((k) => {
      if (before[k] !== after[k]) {
        old_values[k] = before[k];
        new_values[k] = after[k];
      }
    });

    if (Object.keys(new_values).length) {
      await logUpdateCourse({
        actor_user_id,
        course_id,
        old_values,
        new_values,
        request_id,
        transaction: t,
      });
    }

    return after;
  });
}

async function getCourse({ course_id }) {
  const row = await repo.getById(course_id);
  if (!row)
    throw new AppError("COURSE_NOT_FOUND", 404, "COURSE_NOT_FOUND");
  return row;
}

const { getRedis } = require("../../config/redis");

async function listCourses({ year, q, limit, offset }) {
  const redis = getRedis();
  const cacheKey = `courses:list:${year || 'all'}:${q || 'none'}:${limit}:${offset}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Redis get error:", err);
  }

  const rows = await repo.list({ year, q, limit, offset });

  try {
    await redis.set(cacheKey, JSON.stringify(rows), { EX: 60 }); // Cache 60 seconds
  } catch (err) {
    console.error("Redis set error:", err);
  }

  return rows;
}

async function deleteCourse({ actor_user_id, course_id, request_id }) {
  if (!Number.isInteger(course_id) || course_id <= 0)
    throw new AppError("COURSE_ID_INVALID", 400);

  const course = await repo.getById(course_id);
  if (!course)
    throw new AppError("COURSE_NOT_FOUND", 404);

  // Check if course has active published version - prevent deletion
  if (course.active_published_version_id) {
    throw new AppError("Cannot delete a course with an active published version", 400, "COURSE_HAS_ACTIVE_VERSION");
  }

  return db.sequelize.transaction(async (t) => {
    const deleted = await repo.deleteCourse(course_id, { transaction: t });
    if (!deleted)
      throw new AppError("COURSE_DELETE_FAILED", 500);

    await logDeleteCourse({
      actor_user_id,
      course_id,
      old_values: {
        course_name: course.course_name,
        description: course.description,
        year: course.year,
      },
      request_id,
      transaction: t,
    });

    return { deleted: true };
  });
}

module.exports = { createCourse, updateCourse, getCourse, listCourses, deleteCourse };
