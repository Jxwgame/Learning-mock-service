const Joi = require("joi");

const createCourseSchema = Joi.object({
    course_name: Joi.string().trim().max(255).required().messages({
        "any.required": "Course Name is required",
        "string.empty": "Course Name is required",
    }),
    description: Joi.string().allow("", null),
    year: Joi.number().integer().min(1900).max(2100).required().messages({
        "any.required": "Year is required",
        "number.base": "Year must be a number",
    }),
    cover_image_url: Joi.string().uri({ allowRelative: true }).allow("", null),
});

const updateCourseSchema = Joi.object({
    course_name: Joi.string().trim().max(255),
    description: Joi.string().allow("", null),
    year: Joi.number().integer().min(1900).max(2100),
    cover_image_url: Joi.string().uri({ allowRelative: true }).allow("", null),
    active_published_version_id: Joi.number().integer().allow(null),
});

module.exports = {
    createCourseSchema,
    updateCourseSchema,
};
