const Joi = require("joi");
const AppError = require("../errors/AppError");

const validate = (schema, property = "body") => {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req[property], {
                abortEarly: false,
                stripUnknown: true,
            });

            req[property] = value;
            next();
        } catch (error) {
            if (error.isJoi) {
                const message = error.details.map((details) => details.message).join(", ");
                return next(new AppError("VALIDATION_ERROR", 400, message));
            }
            next(error);
        }
    };
};

module.exports = validate;
