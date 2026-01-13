
function setHttpOnlyCookie(res, name, value, { days = 15 } = {}) {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/",
  };
  res.cookie(name, value, options);
}

function setAuthCookies(res, { refreshToken, sessionToken }) {
  // Refresh Token: 7 days
  if (refreshToken) {
    setHttpOnlyCookie(res, "refresh_token", refreshToken, { days: 7 });
  }

  // Session Token: 1 day
  if (sessionToken) {
    setHttpOnlyCookie(res, "session_token", sessionToken, { days: 1 });
  }
}

function clearAuthCookies(res) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.clearCookie("refresh_token", options);
  res.clearCookie("session_token", options);
  res.clearCookie("mfa_trust_device", options);
}

module.exports = { setHttpOnlyCookie, setAuthCookies, clearAuthCookies };