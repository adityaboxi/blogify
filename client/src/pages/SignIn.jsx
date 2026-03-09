import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email address.");
    if (!form.password) return setError("Password is required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    setError("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
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
        width: "100%", maxWidth: "400px",
        boxShadow: "0 4px 24px rgba(230,57,70,0.08)",
        border: "1px solid #ffe5e5"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", color: "#e63946", margin: 0 }}>
            Blogify
          </h1>
          <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Sign in to your account
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
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <Link to="/forgot-password" style={{ color: "#e63946", fontSize: "0.875rem", textDecoration: "none" }}>
              Forgot password?
            </Link>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#e63946", fontWeight: "600", textDecoration: "none" }}>
              Sign Up
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
