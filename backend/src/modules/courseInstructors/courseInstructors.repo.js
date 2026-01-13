const db = require("../../database/models");
const { Op } = db.Sequelize || require("sequelize");

const CourseInstructorModel =
  db.course_instructors;

const CourseModel = db.courses || db.Course;

function uniq(array) {
  return [...new Set(array)];
}

async function findActiveAssignment({ course_id, instructor_id }, options = {}) {
  return CourseInstructorModel.findOne({
    where: { course_id, instructor_id, revoked_at: null },
    order: [["assigned_at", "DESC"], ["id", "DESC"]],
    ...options,
  });
}

async function hasActiveAssignment({ course_id, instructor_id }) {
  const active = await findActiveAssignment({ course_id, instructor_id });
  return !!active;
}

async function assignInstructorToCourse({
  course_id,
  instructor_id,
  role,
  assigned_by,
}, options = {}) {
  const existingActive = await findActiveAssignment({ course_id, instructor_id }, options);
  if (existingActive) {
    return { already_assigned: true, assignment: existingActive.toJSON?.() ?? existingActive };
  }

  const created = await CourseInstructorModel.create({
    course_id,
    instructor_id,
    role,
    assigned_by,
    assigned_at: new Date(),
    revoked_at: null,
  }, options);

  return { already_assigned: false, assignment: created.toJSON?.() ?? created };
}

async function changeInstructorRole({
  course_id,
  instructor_id,
  new_role,
  changed_by,
}, options = {}) {
  const active = await findActiveAssignment({ course_id, instructor_id }, options);
  if (!active) return { ok: false, reason: "NOT_ASSIGNED" };

  await active.update({ revoked_at: new Date() }, options);

  const created = await CourseInstructorModel.create({
    course_id,
    instructor_id,
    role: new_role,
    assigned_by: changed_by,
    assigned_at: new Date(),
    revoked_at: null,
  }, options);

  return { ok: true, assignment: created.toJSON?.() ?? created };
}

async function revokeInstructorFromCourse({ course_id, instructor_id }, options = {}) {
  const active = await findActiveAssignment({ course_id, instructor_id }, options);
  if (!active) return false;

  await active.update({ revoked_at: new Date() }, options);
  return true;
}

async function listActiveInstructorsByCourse(course_id) {
  const rows = await CourseInstructorModel.findAll({
    where: { course_id, revoked_at: null },
    include: [
      {
        model: db.users,
        as: "instructor",
        attributes: ["user_id", "first_name", "last_name", "email"],
      },
    ],
    order: [["role", "ASC"], ["assigned_at", "DESC"]],
    raw: true, // ข้อมูลแบบ Plain Object เลย ไม่เอา Instance
    nest: true, // ให้ Join ออกมาเป็น Object ซ้อนกัน (instructor.first_name)
  });

  return rows.map((r) => {
    const user = r.instructor || {};

    return {
      id: r.id,
      course_id: r.course_id,
      instructor_id: r.instructor_id,
      user_id: r.instructor_id,
      role: r.role,
      assigned_at: r.assigned_at,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      avatar_url: null,
    };
  });
}

async function listInstructorHistoryInCourse({ course_id, instructor_id }) {
  return CourseInstructorModel.findAll({
    where: { course_id, instructor_id },
    order: [["assigned_at", "DESC"], ["id", "DESC"]],
    raw: true,
  });
}

async function listMyActiveTeachingAssignments(instructor_id) {
  return CourseInstructorModel.findAll({
    where: { instructor_id, revoked_at: null },
    attributes: ["course_id", "role", "assigned_at"],
    order: [["assigned_at", "DESC"]],
    raw: true,
  });
}

async function getCoursesByIds(courseIds) {
  if (!courseIds.length) return [];
  return CourseModel.findAll({
    where: { course_id: { [Op.in]: courseIds } },
    attributes: [
      "course_id",
      "course_name",
      "year",
      "description",
      "created_by",
      "created_at",
      "updated_at",
    ],
    raw: true,
  });
}

async function listTeachingCoursesWithMetadata(instructor_id) {
  const activeAssignments = await listMyActiveTeachingAssignments(instructor_id);
  const courseIds = uniq(activeAssignments.map((a) => a.course_id));

  const courses = await getCoursesByIds(courseIds);
  const courseById = new Map(courses.map((course) => [course.course_id, course]));

  return activeAssignments
    .map((assignment) => ({
      course_id: assignment.course_id,
      role: assignment.role,
      assigned_at: assignment.assigned_at,
      course: courseById.get(assignment.course_id) || null,
    }))
    .filter((row) => row.course !== null);
}

async function syncInstructorsInCourse({ course_id, instructors, assigned_by }, options = {}) {
  const useInternalTransaction = !options.transaction;
  const transaction = options.transaction || await db.sequelize.transaction();
  const execOptions = { ...options, transaction };

  try {
    const currentInstructors = await CourseInstructorModel.findAll({
      where: { course_id, revoked_at: null },
      ...execOptions,
    });

    const currentIds = currentInstructors.map(i => i.instructor_id);
    const newIds = instructors.map(i => i.instructor_id);

    const toAdd = instructors.filter(i => !currentIds.includes(i.instructor_id));
    const toRevoke = currentInstructors.filter(i => !newIds.includes(i.instructor_id));

    for (const inst of toRevoke) {
      await inst.update({ revoked_at: new Date() }, execOptions);
    }

    for (const inst of toAdd) {
      const existing = await CourseInstructorModel.findOne({
        where: { course_id, instructor_id: inst.instructor_id, revoked_at: null },
        ...execOptions,
      });

      if (!existing) {
        await CourseInstructorModel.create({
          course_id,
          instructor_id: inst.instructor_id,
          role: inst.role || 'owner',
          assigned_by,
          assigned_at: new Date(),
          revoked_at: null,
        }, execOptions);
      }
    }

    if (useInternalTransaction) await transaction.commit();
    return { added: toAdd.length, revoked: toRevoke.length };
  } catch (error) {
    if (useInternalTransaction) await transaction.rollback();
    throw error;
  }
}

module.exports = {
  hasActiveAssignment,
  findActiveAssignment,

  assignInstructorToCourse,
  changeInstructorRole,
  revokeInstructorFromCourse,
  syncInstructorsInCourse,

  listActiveInstructorsByCourse,
  listInstructorHistoryInCourse,
  listTeachingCoursesWithMetadata,
};
