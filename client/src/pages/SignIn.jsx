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
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={heading}>Welcome back</h2>
        {error && <p style={errStyle}>{error}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input style={input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <p style={foot}>
          <Link to="/forgot-password" style={{ color: "#888" }}>Forgot password?</Link>
        </p>
        <p style={foot}>
          No account? <Link to="/signup" style={{ color: "#111", fontWeight: "600" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const page = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "1rem" };
const card = { width: "100%", maxWidth: "400px", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "2rem" };
const heading = { fontFamily: "Georgia, serif", marginBottom: "1.5rem", fontSize: "1.5rem" };
const input = { padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "1rem", width: "100%", outline: "none" };
const submitBtn = { padding: "0.75rem", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", width: "100%" };
const errStyle = { color: "#c00", marginBottom: "1rem", fontSize: "0.9rem" };
const foot = { marginTop: "1rem", color: "#888", fontSize: "0.9rem" };
