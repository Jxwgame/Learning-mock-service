const Joi = require("joi");

const createLessonSchema = Joi.object({
    lesson_title: Joi.string().trim().max(255).required(),
    lesson_content: Joi.string().allow("", null),
});

const updateLessonSchema = Joi.object({
    lesson_title: Joi.string().trim().max(255),
    lesson_content: Joi.string().allow("", null),
    order_index: Joi.number().integer(),
});

const lessonContentSchema = Joi.object({
    content_type: Joi.string().valid("Text", "Video", "File", "Assignment").required(),
    content_text: Joi.string().allow("", null),
    content_file_url: Joi.string().uri({ allowRelative: true }).allow("", null),
    file_type: Joi.string().max(50).allow("", null),
    sequence_order: Joi.number().integer(),
});

module.exports = {
    createLessonSchema,
    updateLessonSchema,
    lessonContentSchema,
};
