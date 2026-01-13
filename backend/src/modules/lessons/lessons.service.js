const db = require("../../database/models");
const AppError = require("../../core/errors/AppError");
const LessonsRepo = require("./lessons.repo");
const ContentsRepo = require("./lessonContents.repo");
const CoursesRepo = require("../course/course.repo");
const { assertCanAccessCourse } = require("../course/course.policy");

const {
  assertInstructorOfCourse,
  assertDraftEditable,
} = require("../courseVersions/courseVersions.policy");

const {
  logCreateLesson,
  logUpdateLesson,
  logDeleteLesson,
} = require("../../core/logging/composite/lesson.logger");
const {
  logCreateLessonContent,
  logUpdateLessonContent,
  logDeleteLessonContent,
} = require("../../core/logging/composite/lessonContent.logger");

function normalizeLessonCreate(payload) {
  const lesson_title = String(payload.lesson_title || "").trim();
  if (!lesson_title)
    throw new AppError("LESSON_TITLE_REQUIRED", {
      status: 400,
      code: "LESSON_TITLE_REQUIRED",
    });

  return {
    lesson_title,
    lesson_content: payload.lesson_content
      ? String(payload.lesson_content)
      : "",
  };
}

function normalizeLessonUpdate(payload) {
  const patch = {};
  if (payload.lesson_title !== undefined)
    patch.lesson_title = String(payload.lesson_title).trim();
  if (payload.lesson_content !== undefined)
    patch.lesson_content = String(payload.lesson_content);

  if (patch.lesson_title !== undefined && !patch.lesson_title) {
    throw new AppError("LESSON_TITLE_REQUIRED", {
      status: 400,
      code: "LESSON_TITLE_REQUIRED",
    });
  }
  return patch;
}

function normalizeContentCreate(payload) {
  const content_type = String(payload.content_type || "").trim();
  const allowed = ["Text", "File", "Video", "Assignment"];
  if (!allowed.includes(content_type)) {
    throw new AppError("INVALID_CONTENT_TYPE", {
      status: 400,
      code: "INVALID_CONTENT_TYPE",
    });
  }

  return {
    content_type,
    content_text: payload.content_text ? String(payload.content_text) : null,
    content_file_url: payload.content_file_url
      ? String(payload.content_file_url)
      : null,
    file_type: payload.file_type ? String(payload.file_type) : null,
  };
}

function normalizeContentUpdate(payload) {
  const patch = {};
  if (payload.content_text !== undefined)
    patch.content_text = payload.content_text
      ? String(payload.content_text)
      : null;
  if (payload.content_file_url !== undefined)
    patch.content_file_url = payload.content_file_url
      ? String(payload.content_file_url)
      : null;
  if (payload.file_type !== undefined)
    patch.file_type = payload.file_type ? String(payload.file_type) : null;

  return patch;
}

// =========================================================================
//                               LESSON OPERATIONS
// =========================================================================

async function listLessons({ actor_user_id, roles, course_id, version_id, req }) {
  try {
    await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  } catch (err) {
    // If not instructor, check if Learner (Enrolled)
    // and accessing the ACTIVE PUBLISHED version
    try {
      await assertCanAccessCourse({ req, course_id });

      const activeVersionId = await CoursesRepo.getActivePublishedVersionId(
        course_id
      );
      if (
        !activeVersionId ||
        Number(version_id) !== Number(activeVersionId)
      ) {
        throw new Error("Version mismatch or not published");
      }
    } catch (err) {

      if (err.code === "NO_PUBLISHED_VERSION") throw err;

      throw new AppError("FORBIDDEN", { status: 403, code: "FORBIDDEN" });
    }
  }

  return LessonsRepo.listByCourseVersion({ course_id, version_id });
}

async function createLesson({
  actor_user_id,
  roles,
  course_id,
  version_id,
  payload,
  request_id,
}) {
  await assertInstructorOfCourse({ actor_user_id, roles, course_id });
  await assertDraftEditable({ course_id, version_id });

  const data = normalizeLessonCreate(payload);

  return db.sequelize.transaction(async (t) => {
    const lesson = await LessonsRepo.createLesson({
      course_id,
      version_id,
      ...data,
    }, { transaction: t });

    await logCreateLesson({
      actor_user_id,
      course_id,
      version_id,
      lesson_id: lesson.lesson_id,
      new_values: {
        lesson_title: lesson.lesson_title,
      },
      request_id,
      transaction: t,
    });

    return lesson;
  });
}

async function updateLesson({
  actor_user_id,
  roles,
  lesson_id,
  payload,
  request_id,
}) {
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", {
      status: 404,
      code: "LESSON_NOT_FOUND",
    });

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  const before = lesson;
  const patch = normalizeLessonUpdate(payload);

  return db.sequelize.transaction(async (t) => {
    const updated = await LessonsRepo.updateLesson(lesson_id, patch, { transaction: t });

    const old_values = {};
    const new_values = {};
    ["lesson_title", "lesson_order"].forEach((k) => {
      if (before[k] !== updated[k]) {
        old_values[k] = before[k];
        new_values[k] = updated[k];
      }
    });

    if (Object.keys(new_values).length) {
      await logUpdateLesson({
        actor_user_id,
        course_id: lesson.course_id,
        version_id: lesson.version_id,
        lesson_id,
        old_values,
        new_values,
        request_id,
        transaction: t,
      });
    }

    return updated;
  });
}

async function deleteLesson({ actor_user_id, roles, lesson_id, request_id }) {
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", {
      status: 404,
      code: "LESSON_NOT_FOUND",
    });

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  return db.sequelize.transaction(async (t) => {
    await LessonsRepo.deleteLesson(lesson_id, { transaction: t });

    await logDeleteLesson({
      actor_user_id,
      course_id: lesson.course_id,
      version_id: lesson.version_id,
      lesson_id,
      request_id,
      transaction: t,
    });
  });
}

// =========================================================================
//                             CONTENT OPERATIONS
// =========================================================================

async function listLessonContents({ actor_user_id, roles, lesson_id, req }) {
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", {
      status: 404,
      code: "LESSON_NOT_FOUND",
    });

  try {
    await assertInstructorOfCourse({
      actor_user_id,
      roles,
      course_id: lesson.course_id,
    });
  } catch (err) {
    //  If not instructor, check if Learner (Enrolled)
    // AND accessing the ACTIVE PUBLISHED version
    try {
      await assertCanAccessCourse({ req, course_id: lesson.course_id });

      const activeVersionId = await CoursesRepo.getActivePublishedVersionId(
        lesson.course_id
      );

      if (
        !activeVersionId ||
        Number(lesson.version_id) !== Number(activeVersionId)
      ) {
        throw new Error("Lesson version mismatch or not published");
      }
    } catch (err) {
      throw new AppError("FORBIDDEN", { status: 403, code: "FORBIDDEN" });
    }
  }

  return ContentsRepo.listByLesson(lesson_id);
}

async function addLessonContent({
  actor_user_id,
  roles,
  lesson_id,
  payload,
  request_id,
}) {
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson) throw new AppError("LESSON_NOT_FOUND", { status: 404 });

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  const data = normalizeContentCreate(payload);

  return db.sequelize.transaction(async (t) => {
    const content = await ContentsRepo.createContent({
      lesson_id,
      ...data,
    }, { transaction: t });

    await logCreateLessonContent({
      actor_user_id,
      course_id: lesson.course_id,
      version_id: lesson.version_id,
      lesson_id,
      content_id: content.content_id,
      new_values: {
        content_type: content.content_type,
        order: content.order,
      },
      request_id,
      transaction: t,
    });

    return content;
  });
}

async function updateLessonContent({
  actor_user_id,
  roles,
  content_id,
  payload,
  request_id,
}) {
  const content = await ContentsRepo.getById(content_id);
  if (!content) throw new AppError("CONTENT_NOT_FOUND", { status: 404 });

  const lesson = await LessonsRepo.getLessonById(content.lesson_id);
  if (!lesson) throw new AppError("LESSON_NOT_FOUND", { status: 404 });

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  const before = content;
  const patch = normalizeContentUpdate(payload);

  return db.sequelize.transaction(async (t) => {
    const updated = await ContentsRepo.updateContent(content_id, patch, { transaction: t });

    const old_values = {};
    const new_values = {};
    ["content_type", "content_value", "order"].forEach((k) => {
      if (before[k] !== updated[k]) {
        old_values[k] = before[k];
        new_values[k] = updated[k];
      }
    });

    if (Object.keys(new_values).length) {
      await logUpdateLessonContent({
        actor_user_id,
        course_id: lesson.course_id,
        version_id: lesson.version_id,
        lesson_id: lesson.lesson_id,
        content_id,
        old_values,
        new_values,
        request_id,
        transaction: t,
      });
    }

    return updated;
  });
}

async function deleteLessonContent({
  actor_user_id,
  roles,
  content_id,
  request_id,
}) {
  const content = await ContentsRepo.getById(content_id);
  if (!content) throw new AppError("CONTENT_NOT_FOUND", { status: 404 });

  const lesson = await LessonsRepo.getLessonById(content.lesson_id);
  if (!lesson) throw new AppError("LESSON_NOT_FOUND", { status: 404 });

  await assertInstructorOfCourse({
    actor_user_id,
    roles,
    course_id: lesson.course_id,
  });
  await assertDraftEditable({
    course_id: lesson.course_id,
    version_id: lesson.version_id,
  });

  return db.sequelize.transaction(async (t) => {
    await ContentsRepo.deleteContent(content_id, { transaction: t });

    await logDeleteLessonContent({
      actor_user_id,
      course_id: lesson.course_id,
      version_id: lesson.version_id,
      lesson_id: lesson.lesson_id,
      content_id,
      request_id,
      transaction: t,
    });

    return { deleted: true };
  });
}

// =========================================================================
//                            PUBLISHED READ OPERATIONS
// =========================================================================

async function listPublishedLessons({ course_id, req }) {
  await assertCanAccessCourse({ req, course_id });

  const activeVersionId = await CoursesRepo.getActivePublishedVersionId(
    course_id
  );
  if (!activeVersionId) {
    throw new AppError("NO_PUBLISHED_VERSION", {
      status: 404,
      code: "NO_PUBLISHED_VERSION",
    });
  }

  return LessonsRepo.listByCourseVersion({
    course_id,
    version_id: activeVersionId,
  });
}

async function listPublishedLessonContents({ course_id, lesson_id, req }) {
  await assertCanAccessCourse({ req, course_id });

  const activeVersionId = await CoursesRepo.getActivePublishedVersionId(
    course_id
  );
  if (!activeVersionId) {
    throw new AppError("NO_PUBLISHED_VERSION", {
      status: 404,
      code: "NO_PUBLISHED_VERSION",
    });
  }

  // ต้องกันไม่ให้ยิง lessonId ของ version อื่นมาอ่าน
  const lesson = await LessonsRepo.getLessonById(lesson_id);
  if (!lesson)
    throw new AppError("LESSON_NOT_FOUND", {
      status: 404,
      code: "LESSON_NOT_FOUND",
    });

  if (
    Number(lesson.course_id) !== Number(course_id) ||
    Number(lesson.version_id) !== Number(activeVersionId)
  ) {
    throw new AppError("FORBIDDEN", { status: 403, code: "FORBIDDEN" });
  }

  return ContentsRepo.listByLesson(lesson_id);
}

module.exports = {
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  listLessonContents,
  addLessonContent,
  updateLessonContent,
  deleteLessonContent,
  listPublishedLessons,
  listPublishedLessonContents,
};
