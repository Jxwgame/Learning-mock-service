const Joi = require("joi");

const updateMeSchema = Joi.object({
    first_name: Joi.string().trim().required(),
    last_name: Joi.string().trim().required(),
});

module.exports = {
    updateMeSchema,
};
