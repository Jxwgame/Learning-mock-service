const Joi = require("joi");

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    first_name: Joi.string().trim().required(),
    last_name: Joi.string().trim().required(),
    role_ids: Joi.array().items(Joi.number().integer().positive()).allow(null),
});

const updateUserSchema = Joi.object({
    email: Joi.string().email(),
    first_name: Joi.string().trim(),
    last_name: Joi.string().trim(),
    is_active: Joi.boolean(),
});

const assignRoleSchema = Joi.object({
    role_id: Joi.number().integer().positive().required(),
});

const createPermissionSchema = Joi.object({
    permission_name: Joi.string().pattern(/^[a-zA-Z0-9.]+$/).required().messages({
        "string.pattern.base": "Permission name must properly formatted (e.g. 'resource.action')",
    }),
    description: Joi.string().allow("", null),
});

const updatePermissionSchema = Joi.object({
    permission_name: Joi.string().pattern(/^[a-zA-Z0-9.]+$/),
    description: Joi.string().allow("", null),
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    assignRoleSchema,
    createPermissionSchema,
    updatePermissionSchema,
};
