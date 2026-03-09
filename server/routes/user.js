const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendOTPEmail } = require("../services/email");

const router = Router();

// Get current user
router.get("/me", (req, res) => {
  if (!req.user) return res.json({ user: null });
  return res.json({ user: req.user });
});

// Sign Up
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ error: "All fields are required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  try {
    await User.create({ fullName, email, password });
    return res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "Email already in use." });
    return res.status(500).json({ error: "Signup failed." });
  }
});

// Sign In — return token in body
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.json({ success: true, token });
  } catch {
    return res.status(401).json({ error: "Invalid email or password." });
  }
});

// Logout
router.get("/logout", (req, res) => {
  return res.json({ success: true });
});

// Forgot Password — Send OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No account found with that email." });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendOTPEmail(email, otp);
    return res.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Failed to send OTP." });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.resetOTP || user.resetOTPExpiry < new Date())
      return res.status(400).json({ error: "OTP expired. Request a new one." });
    const isValid = await bcrypt.compare(otp, user.resetOTP);
    if (!isValid) return res.status(400).json({ error: "Invalid OTP." });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Verification failed." });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.resetOTP || user.resetOTPExpiry < new Date())
      return res.status(400).json({ error: "OTP expired." });
    const isValid = await bcrypt.compare(otp, user.resetOTP);
    if (!isValid) return res.status(400).json({ error: "Invalid OTP." });
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Reset failed." });
  }
});

module.exports = router;
