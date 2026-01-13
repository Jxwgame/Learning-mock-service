const jwt = require("jsonwebtoken");

function signAccessToken({ user_id, session_id, roles = [] }) {
  const expiresIn = `${Number(process.env.JWT_ACCESS_EXPIRES_MIN)}m`;

  return jwt.sign(
    {
      sub: String(user_id),
      sid: String(session_id),
      roles,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn, algorithm: "HS256" }
  );
}

module.exports = { signAccessToken };