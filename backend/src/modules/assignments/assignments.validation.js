const Joi = require("joi");

const createAssignmentSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Title is required",
        "any.required": "Title is required",
    }),
    description: Joi.string().allow("", null),
    due_date: Joi.date().iso().allow(null),
    max_score: Joi.number().min(0).allow(null),
});

const updateAssignmentSchema = Joi.object({
    title: Joi.string().trim().allow(null, ""),
    description: Joi.string().allow("", null),
    due_date: Joi.date().iso().allow(null),
    max_score: Joi.number().min(0).allow(null),
});

const createSubmissionSchema = Joi.object({
    file_url: Joi.string().uri().allow("", null),
    comments: Joi.string().allow("", null),
}).or("file_url", "comments");

const gradeSubmissionSchema = Joi.object({
    grade: Joi.number().min(0).required(),
    feedback: Joi.string().allow("", null),
});

module.exports = {
    createAssignmentSchema,
    updateAssignmentSchema,
    createSubmissionSchema,
    gradeSubmissionSchema,
};
