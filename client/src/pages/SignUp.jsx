import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (form.fullName.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email address.");
    if (!form.password) return setError("Password is required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!agreed) return setError("You must agree to the terms to create an account.");

    setLoading(true);
    setError("");
    try {
      await signup(form.fullName.trim(), form.email.trim(), form.password);
      navigate("/signin", { state: { message: "Account created! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", color: "#e63946", margin: 0 }}>
            Join Blogify
          </h1>
          <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Create your account to start writing
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fff0f0", border: "1px solid #ffcccc",
            borderRadius: "6px", padding: "0.75rem",
            color: "#c00", fontSize: "0.875rem", marginBottom: "1rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Aditya Boxi"
              value={form.fullName}
              onChange={e => { setForm({ ...form, fullName: e.target.value }); setError(""); }}
              disabled={loading}
              autoComplete="name"
              maxLength={50}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => { setForm({ ...form, confirm: e.target.value }); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
              disabled={loading}
              autoComplete="new-password"
            />
            {form.password && form.confirm && (
              <p style={{
                fontSize: "0.8rem", marginTop: "0.3rem",
                color: form.password === form.confirm ? "#276749" : "#c00"
              }}>
                {form.password === form.confirm ? "✅ Passwords match" : "❌ Passwords don't match"}
              </p>
            )}
          </div>

          {/* Terms agreement */}
          <div style={{
            background: "#fff8f8", border: "1px solid #ffe0e0",
            borderRadius: "8px", padding: "0.75rem"
          }}>
            <label style={{ display: "flex", gap: "0.75rem", cursor: "pointer", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => { setAgreed(e.target.checked); setError(""); }}
                style={{ marginTop: "3px", accentColor: "#e63946" }}
                disabled={loading}
              />
              <span style={{ fontSize: "0.8rem", color: "#555", lineHeight: "1.5" }}>
                I understand my posts will be <strong>publicly visible</strong> and my email
                may be used to send <strong>OTP codes</strong> for authentication.
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "0.9rem",
              background: loading ? "#ccc" : "#e63946",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "1rem", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: "#e63946", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#333", marginBottom: "0.4rem" };
const inputStyle = {
  width: "100%", padding: "0.75rem", border: "1px solid #ddd",
  borderRadius: "6px", fontSize: "1rem", outline: "none",
  boxSizing: "border-box", background: "#fff"
};
