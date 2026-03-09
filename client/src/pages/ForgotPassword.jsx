import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimeLeft(10 * 60); // 10 minutes in seconds
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setError("OTP expired. Please request a new one.");
          setStep(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isTimerRed = timeLeft > 0 && timeLeft <= 60;

  const handleSendOTP = async () => {
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/user/forgot-password", { email: email.trim() });
      setSuccess("OTP sent to your email. Check your inbox.");
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return setError("OTP is required.");
    if (otp.length !== 6) return setError("OTP must be 6 digits.");
    if (timeLeft === 0) return setError("OTP expired. Please request a new one.");
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/user/verify-otp", { email, otp });
      clearInterval(timerRef.current);
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return setError("Password is required.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/user/reset-password", { email, otp, newPassword });
      setSuccess("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp("");
    setError("");
    setSuccess("");
    await handleSendOTP();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#fff5f5", padding: "1rem"
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px", padding: "2.5rem",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 4px 24px rgba(230,57,70,0.08)",
        border: "1px solid #ffe5e5"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "48px", height: "48px", background: "#e63946",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.4rem"
          }}>🔐</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", margin: 0 }}>
            Reset Password
          </h1>
          <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: "4px", borderRadius: "2px",
              background: step >= s ? "#e63946" : "#f0f0f0",
              transition: "background 0.3s"
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            background: "#fff0f0", border: "1px solid #ffcccc",
            borderRadius: "6px", padding: "0.75rem", color: "#c00",
            fontSize: "0.875rem", marginBottom: "1rem"
          }}>⚠️ {error}</div>
        )}

        {success && (
          <div style={{
            background: "#f0fff4", border: "1px solid #b2f5c8",
            borderRadius: "6px", padding: "0.75rem", color: "#276749",
            fontSize: "0.875rem", marginBottom: "1rem"
          }}>✅ {success}</div>
        )}

        {/* Step 1 — Email */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                disabled={loading}
              />
            </div>
            <button onClick={handleSendOTP} disabled={loading} style={btnStyle}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
              Remember your password?{" "}
              <span onClick={() => navigate("/signin")} style={linkStyle}>Sign In</span>
            </p>
          </div>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Timer */}
            <div style={{
              textAlign: "center", padding: "1rem",
              background: isTimerRed ? "#fff0f0" : "#f9f9f9",
              borderRadius: "8px", border: `1px solid ${isTimerRed ? "#ffcccc" : "#eee"}`,
              transition: "all 0.3s"
            }}>
              <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 0.3rem" }}>
                OTP expires in
              </p>
              <p style={{
                fontSize: "2rem", fontWeight: "700", margin: 0,
                color: isTimerRed ? "#e63946" : "#111",
                fontFamily: "monospace",
                animation: isTimerRed ? "pulse 1s infinite" : "none"
              }}>
                {formatTime(timeLeft)}
              </p>
            </div>

            <div>
              <label style={labelStyle}>6-Digit OTP</label>
              <input
                style={{ ...inputStyle, letterSpacing: "0.3rem", fontSize: "1.2rem", textAlign: "center" }}
                type="text"
                placeholder="000000"
                value={otp}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                  setError("");
                }}
                onKeyDown={e => e.key === "Enter" && handleVerifyOTP()}
                maxLength={6}
                disabled={loading}
              />
            </div>

            <button onClick={handleVerifyOTP} disabled={loading || timeLeft === 0} style={{
              ...btnStyle,
              background: (loading || timeLeft === 0) ? "#ccc" : "#e63946",
              cursor: (loading || timeLeft === 0) ? "not-allowed" : "pointer"
            }}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button onClick={handleResend} disabled={loading} style={{
              ...btnStyle, background: "transparent",
              color: "#e63946", border: "1px solid #e63946"
            }}>
              Resend OTP
            </button>
          </div>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(""); }}
                disabled={loading}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                disabled={loading}
              />
            </div>
            {newPassword && confirmPassword && (
              <p style={{
                fontSize: "0.8rem",
                color: newPassword === confirmPassword ? "#276749" : "#c00"
              }}>
                {newPassword === confirmPassword ? "✅ Passwords match" : "❌ Passwords don't match"}
              </p>
            )}
            <button onClick={handleResetPassword} disabled={loading} style={btnStyle}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#333", marginBottom: "0.4rem" };
const inputStyle = {
  width: "100%", padding: "0.75rem", border: "1px solid #ddd",
  borderRadius: "6px", fontSize: "1rem", outline: "none",
  boxSizing: "border-box", background: "#fff"
};
const btnStyle = {
  padding: "0.9rem", background: "#e63946", color: "#fff",
  border: "none", borderRadius: "8px", fontSize: "1rem",
  fontWeight: "600", cursor: "pointer", width: "100%"
};
const linkStyle = { color: "#e63946", cursor: "pointer", fontWeight: "600" };
