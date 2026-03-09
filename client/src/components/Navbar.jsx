import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      // logout should never fail but just in case
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "2px solid #e63946",
      padding: "0 1.5rem",
      height: "60px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(230,57,70,0.08)"
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "Georgia, serif", fontSize: "1.5rem",
          fontWeight: "700", color: "#e63946", letterSpacing: "-0.5px"
        }}>
          Blogify
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <NavLink to="/" active={isActive("/")}>Home</NavLink>

        {user ? (
          <>
            <NavLink to="/add-blog" active={isActive("/add-blog")}>Write</NavLink>
            <span style={{
              fontSize: "0.875rem", color: "#666",
              padding: "0 0.5rem", maxWidth: "120px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {user.fullName?.split(" ")[0] || "User"}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.4rem 1rem",
                background: "#e63946", color: "#fff",
                border: "none", borderRadius: "6px",
                fontSize: "0.875rem", fontWeight: "600",
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={e => e.target.style.background = "#c1121f"}
              onMouseLeave={e => e.target.style.background = "#e63946"}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/signin" active={isActive("/signin")}>Sign In</NavLink>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "0.4rem 1rem",
                background: "#e63946", color: "#fff",
                border: "none", borderRadius: "6px",
                fontSize: "0.875rem", fontWeight: "600",
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={e => e.target.style.background = "#c1121f"}
              onMouseLeave={e => e.target.style.background = "#e63946"}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "0.4rem 0.75rem",
        fontSize: "0.9rem",
        color: active ? "#e63946" : "#555",
        fontWeight: active ? "600" : "400",
        borderBottom: active ? "2px solid #e63946" : "2px solid transparent",
        transition: "color 0.2s",
      }}
    >
      {children}
    </Link>
  );
}
