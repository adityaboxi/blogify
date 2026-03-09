import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup(form.fullName, form.email, form.password);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={heading}>Create Account</h2>
        {error && <p style={errStyle}>{error}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input style={input} type="text" placeholder="Full Name"
            value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          <input style={input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={input} type="password" placeholder="Password (min 6 chars)"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
        <p style={foot}>
          Have an account? <Link to="/signin" style={{ color: "#111", fontWeight: "600" }}>Sign In</Link>
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
