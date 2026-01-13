const db = require("../../database/models");

const EnrollmentModel = db.enrollments;
const CourseModel = db.courses;

function toPlain(row) {
  return row && typeof row.toJSON === "function" ? row.toJSON() : row;
}

async function getByUserAndCourse({ user_id, course_id }) {
  return EnrollmentModel.findOne({
    where: { user_id, course_id },
    raw: true,
  });
}

async function listActiveByUser({ user_id }) {
  const rows = await EnrollmentModel.findAll({
    where: { user_id, status: "active" },
    order: [["enrolled_at", "DESC"]],
    include: [{
      model: CourseModel,
      attributes: ["course_id", "course_name", "description", "year", "cover_image_url"],
    }],
  });

  return rows.map(row => {
    const plain = toPlain(row);
    const course = plain.course || {};
    return {
      ...plain,
      course_name: course.course_name,
      description: course.description,
      year: course.year,
      cover_image_url: course.cover_image_url,
    };
  });
}

async function enrollCourse({ actor_user_id, course_id }, options = {}) {
  const course = await db.courses.findOne({
    where: { course_id },
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
    ...options,
  });

  if (!course) {
    const err = new Error("COURSE_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const existing = await db.enrollments.findOne({
    where: { user_id: actor_user_id, course_id },
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
    ...options,
  });

  // CASE 1: already active
  if (existing) {
    const oldStatus = existing.status;

    if (oldStatus === "active") {
      return {
        enrollment_id: existing.enrollment_id,
        old_status: "active",
        new_status: "active",
        changed: false,
      };
    }

    // CASE 2: re-activate
    await existing.update(
      {
        status: "active",
        enrolled_at: new Date(),
        completed_at: null,
      },
      options
    );

    return {
      enrollment_id: existing.enrollment_id,
      old_status: oldStatus,
      new_status: "active",
      changed: true,
    };
  }

  // CASE 3: create new enrollment
  const row = await db.enrollments.create(
    {
      user_id: actor_user_id,
      course_id,
      status: "active",
      enrolled_at: new Date(),
    },
    options
  );

  return {
    enrollment_id: row.enrollment_id,
    old_status: null,
    new_status: "active",
    changed: true,
  };
}

// Cancel/Unenroll from a course
//Changes status to "cancelled" instead of deleting the record
async function unenrollCourse({ actor_user_id, course_id }, options = {}) {
  const existing = await db.enrollments.findOne({
    where: { user_id: actor_user_id, course_id },
    lock: options.transaction ? options.transaction.LOCK.UPDATE : false,
    ...options,
  });

  if (!existing) {
    const err = new Error("NOT_ENROLLED");
    err.status = 404;
    throw err;
  }

  const oldStatus = existing.status;

  if (oldStatus === "cancelled") {
    return {
      enrollment_id: existing.enrollment_id,
      old_status: "cancelled",
      new_status: "cancelled",
      changed: false,
    };
  }

  await existing.update(
    {
      status: "cancelled",
    },
    options
  );

  return {
    enrollment_id: existing.enrollment_id,
    old_status: oldStatus,
    new_status: "cancelled",
    changed: true,
  };
}

module.exports = {
  getByUserAndCourse,
  listActiveByUser,
  enrollCourse,
  unenrollCourse,
};
