const Joi = require("joi");

const enrollmentParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
}).unknown(true);

module.exports = {
    enrollmentParamsSchema,
};
