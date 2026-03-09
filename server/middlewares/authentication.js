const { validateToken } = require("../services/authentication");

function checkAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];
    if (!token) return next();
    try {
      req.user = validateToken(token);
    } catch (err) {
      // Invalid/expired token — clear it
      res.clearCookie(cookieName);
    }
    return next();
  };
}

function restrictToLoggedInUsersOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized. Please sign in." });
  return next();
}

module.exports = { checkAuthenticationCookie, restrictToLoggedInUsersOnly };