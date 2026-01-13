const db = require("../../database/models");
const { Op } = require("sequelize");

const CourseVersionModel = db.course_versions;
const CourseModel = db.courses;

async function getById(version_id) {
  return CourseVersionModel.findOne({ where: { version_id }, raw: true });
}

async function listByCourse(course_id) {
  return CourseVersionModel.findAll({
    where: { course_id },
    order: [["version_number", "DESC"]],
    raw: true,
  });
}

async function getNextVersionNumber(course_id, options = {}) {
  const latest = await CourseVersionModel.findOne({
    where: { course_id },
    attributes: ["version_number"],
    order: [["version_number", "DESC"]],
    raw: true,
    ...options
  });

  const maxNum = latest?.version_number ? Number(latest.version_number) : 0;
  return maxNum + 1;
}

async function createDraft({ course_id, version_number, instructor_id }, options = {}) {
  const version = await CourseVersionModel.create(
    {
      course_id,
      version_number,
      instructor_id,
      status: "Draft",
      created_at: new Date(),
      updated_at: new Date(),
    },
    options
  );

  return {
    version_id: version.version_id,
    old_status: null,
    new_status: "Draft",
  };
}

async function getActivePublishedVersionId(course_id) {
  const course = await CourseModel.findOne({
    where: { course_id },
    attributes: ["active_published_version_id"],
    raw: true,
  });
  return course?.active_published_version_id || null;
}

async function publishAndSetActive({ course_id, version_id }, options = {}) {
  const version = await CourseVersionModel.findOne({
    where: { version_id, course_id },
    ...options,
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
  });

  if (!version) {
    const err = new Error("VERSION_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  if (String(version.status).toLowerCase() !== "draft") {
    const err = new Error("VERSION_NOT_EDITABLE");
    err.status = 409;
    throw err;
  }

  const old_status = version.status;

  await version.update(
    { status: "Published", updated_at: new Date() },
    options
  );

  await CourseModel.update(
    { active_published_version_id: version_id, updated_at: new Date() },
    { where: { course_id }, ...options }
  );

  return {
    version_id,
    old_status,
    new_status: "Published",
  };
}

async function setActivePublishedVersion({ course_id, version_id }, options = {}) {
  const course = await CourseModel.findOne({
    where: { course_id },
    ...options,
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
  });
  if (!course) {
    const err = new Error("COURSE_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const from_version_id = course.active_published_version_id;

  const version = await CourseVersionModel.findOne({
    where: { version_id, course_id },
    ...options,
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
  });
  if (!version) {
    const err = new Error("VERSION_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  if (String(version.status).toLowerCase() !== "published") {
    const err = new Error("VERSION_NOT_PUBLISHED");
    err.status = 409;
    throw err;
  }

  await course.update(
    { active_published_version_id: version_id, updated_at: new Date() },
    options
  );

  return {
    from_version_id,
    to_version_id: version_id,
  };
}

async function archiveVersion({ course_id, version_id }, options = {}) {
  const version = await CourseVersionModel.findOne({
    where: { version_id, course_id },
    ...options,
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
  });

  if (!version) {
    const err = new Error("VERSION_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const old_status = version.status;

  await version.update(
    { status: "Archived", updated_at: new Date() },
    options
  );

  return {
    version_id,
    old_status,
    new_status: "Archived",
  };
}

module.exports = {
  getById,
  listByCourse,
  getNextVersionNumber,
  createDraft,
  publishAndSetActive,
  setActivePublishedVersion,
  getActivePublishedVersionId,
  archiveVersion,
};
