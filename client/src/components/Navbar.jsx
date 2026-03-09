import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "1rem 2rem", borderBottom: "1px solid #e5e5e5",
      position: "sticky", top: 0, background: "#fff", zIndex: 100,
    }}>
      <Link to="/" style={{ fontSize: "1.3rem", fontWeight: "700", color: "#111", fontFamily: "Georgia, serif" }}>
        Blogify
      </Link>
      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
        <Link to="/" style={link}>Home</Link>
        {user ? (
          <>
            <Link to="/blog/add" style={link}>Write</Link>
            <span style={{ color: "#666", fontSize: "0.9rem" }}>{user.fullName}</span>
            <button onClick={handleLogout} style={btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin" style={link}>Sign In</Link>
            <Link to="/signup" style={{ ...btn, textDecoration: "none" }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const link = { color: "#555", fontSize: "0.95rem", transition: "color 0.2s" };
const btn = {
  background: "#111", color: "#fff", border: "none",
  padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.9rem",
};