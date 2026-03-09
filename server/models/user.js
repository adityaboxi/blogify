const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "/images/default.png" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetOTP: { type: String },
    resetOTPExpiry: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Match password and return JWT
userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");
  return createTokenForUser(user);
});

module.exports = model("User", userSchema);