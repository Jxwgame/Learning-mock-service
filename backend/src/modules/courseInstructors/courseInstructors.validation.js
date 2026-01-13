const Joi = require("joi");

const assignInstructorSchema = Joi.object({
    instructor_id: Joi.number().integer().positive().required(),
    role: Joi.string().valid("owner", "assistant").default("owner"),
});

const syncInstructorsSchema = Joi.object({
    instructors: Joi.array()
        .items(
            Joi.object({
                instructor_id: Joi.number().integer().positive().required(),
                role: Joi.string().valid("owner", "assistant").default("owner"),
            })
        )
        .required(),
});

module.exports = {
    assignInstructorSchema,
    syncInstructorsSchema,
};
