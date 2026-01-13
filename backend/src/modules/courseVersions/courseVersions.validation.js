const Joi = require("joi");

const courseParamsSchema = Joi.object({
    courseId: Joi.number().integer().positive().required(),
}).unknown(true);
const courseVersionParamsSchema = Joi.object({
    courseId: Joi.number().integer().positive().required(),
    versionId: Joi.number().integer().positive().required(),
}).unknown(true);

module.exports = {
    courseParamsSchema,
    courseVersionParamsSchema,
};
