const Joi = require("joi");

const googleLoginSchema = Joi.object({
    id_token: Joi.string().required(),
    device_id: Joi.string().required(),
});

const mfaChallengeSchema = Joi.object({
    mfa_tx: Joi.string().required(),
    channel: Joi.string().valid("email").default("email"),
});

const mfaVerifySchema = Joi.object({
    mfa_tx: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
        "string.length": "OTP must be 6 digits",
        "string.pattern.base": "OTP must be numeric",
    }),
    device_id: Joi.string().required(),
    trust_device: Joi.boolean().default(false),
});

module.exports = {
    googleLoginSchema,
    mfaChallengeSchema,
    mfaVerifySchema,
};
