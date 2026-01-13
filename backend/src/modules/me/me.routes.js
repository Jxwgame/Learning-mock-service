const express = require("express");
const { authRequired } = require("../../core/middlewares/authRequired");
const validate = require("../../core/middlewares/validate");
const { updateMeSchema } = require("./me.validation");
const controller = require("./me.controller");

const router = express.Router();

router.get("/me", authRequired, controller.getMe);
router.patch("/me", authRequired, validate(updateMeSchema), controller.updateMe);

module.exports = router;
