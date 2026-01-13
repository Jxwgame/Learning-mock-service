const express = require("express");
const router = express.Router();
const controller = require("./dashboard.controller");
const { authRequired } = require("../../core/middlewares/authRequired");

router.get("/stats", authRequired, controller.getStats);

module.exports = router;
