import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post("/api/user/forgot-password", { email });
      setSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post("/api/user/verify-otp", { email, otp });
      setSuccess("OTP verified!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true); setError("");
    try {
      await axios.post("/api/user/reset-password", { email, otp, newPassword });
      setSuccess("Password reset! Redirecting...");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed.");
    } finally { setLoading(false); }
  };

  const steps = ["Email", "OTP", "Password"];

  return (
    <div style={page}>
      <div style={cardStyle}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", justifyContent: "center" }}>
          {steps.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "600",
                background: step > i + 1 ? "#111" : step === i + 1 ? "#111" : "#e5e5e5",
                color: step >= i + 1 ? "#fff" : "#888",
              }}>{step > i + 1 ? "✓" : i + 1}</div>
              <span style={{ fontSize: "0.8rem", color: step === i + 1 ? "#111" : "#aaa" }}>{label}</span>
              {i < 2 && <div style={{ width: "20px", height: "1px", background: "#ddd" }} />}
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "0.5rem" }}>
          {step === 1 ? "Forgot Password" : step === 2 ? "Enter OTP" : "New Password"}
        </h2>
        <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {step === 1 ? "Enter your email to receive an OTP" : step === 2 ? `OTP sent to ${email}` : "Choose a strong password"}
        </p>

        {error && <p style={{ color: "#c00", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "1rem", fontSize: "0.875rem" }}>{success}</p>}

        {step === 1 && (
          <div style={form}>
            <input style={input} type="email" placeholder="Your email"
              value={email} onChange={e => setEmail(e.target.value)} required />
            <button style={btn} onClick={handleSendOTP} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}
        {step === 2 && (
          <div style={form}>
            <input style={{ ...input, textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" }}
              type="text" placeholder="000000" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value)} required />
            <button style={btn} onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button style={{ ...btn, background: "#f5f5f5", color: "#111" }}
              onClick={() => { setStep(1); setError(""); setSuccess(""); }}>← Back</button>
          </div>
        )}
        {step === 3 && (
          <div style={form}>
            <input style={input} type="password" placeholder="New password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <input style={input} type="password" placeholder="Confirm password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <button style={btn} onClick={handleResetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
          <Link to="/signin" style={{ color: "#888" }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const page = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "1rem" };
const cardStyle = { width: "100%", maxWidth: "420px", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "2rem" };
const form = { display: "flex", flexDirection: "column", gap: "1rem" };
const input = { padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "1rem", width: "100%", outline: "none" };
const btn = { padding: "0.75rem", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600" };