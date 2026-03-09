const JWT = require("jsonwebtoken");

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return process.env.JWT_SECRET;
}

function createTokenForUser(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    profileImageURL: user.profileImage,
  };
  return JWT.sign(payload, getSecret(), { expiresIn: "7d" });
}

function validateToken(token) {
  return JWT.verify(token, getSecret());
}

module.exports = { createTokenForUser, validateToken };