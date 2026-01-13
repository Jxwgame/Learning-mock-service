const express = require("express");
const {
  googleExchangeController,
  mfaChallengeController,
  mfaVerifyController,
  refreshAccessController,
  logoutController,
  logoutAllController,
  checkSessionController,
} = require("./auth.controller");

const { authRequired } = require("../../core/middlewares/authRequired");
const { rateLimit } = require("../../core/middlewares/rateLimit");
const validate = require("../../core/middlewares/validate");
const {
  googleLoginSchema,
  mfaChallengeSchema,
  mfaVerifySchema,
} = require("./auth.validation");

const router = express.Router();

router.post(
  "/login",
  rateLimit({ windowSec: 60, max: 10, keyPrefix: "rl:auth:google" }),
  validate(googleLoginSchema),
  googleExchangeController
);

router.post(
  "/mfa/challenge",
  rateLimit({ windowSec: 60, max: 5, keyPrefix: "rl:auth:mfaChallenge" }),
  validate(mfaChallengeSchema),
  mfaChallengeController
);

router.post(
  "/mfa/verify",
  rateLimit({ windowSec: 60, max: 10, keyPrefix: "rl:auth:mfa" }),
  validate(mfaVerifySchema),
  mfaVerifyController
);

router.get("/session", checkSessionController);

router.post(
  "/refresh",
  rateLimit({ windowSec: 60, max: 30, keyPrefix: "rl:auth:refresh" }),
  refreshAccessController
);

router.post(
  "/logout",
  authRequired,
  rateLimit({ windowSec: 60, max: 20, keyPrefix: "rl:auth:logout" }),
  logoutController
);

router.post(
  "/logout-all",
  authRequired,
  rateLimit({ windowSec: 60, max: 5, keyPrefix: "rl:auth:logoutAll" }),
  logoutAllController
);

module.exports = router;
