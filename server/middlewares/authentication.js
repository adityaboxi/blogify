const { validateToken } = require("../services/authentication");

function checkAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    // Check Authorization header first
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        req.user = validateToken(token);
      } catch {
        // invalid token
      }
      return next();
    }

    // Fallback to cookie
    const token = req.cookies[cookieName];
    if (!token) return next();
    try {
      req.user = validateToken(token);
    } catch {
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
