import { useNavigate } from "react-router-dom";

export default function BlogCard({ blog }) {
  const navigate = useNavigate();

  // Null safety — never crash
  if (!blog || !blog._id) return null;

  const title = blog.title?.trim() || "Untitled Post";
  const body = blog.body?.trim() || "";
  const excerpt = body.length > 120 ? body.substring(0, 120) + "..." : body || "No content preview available.";
  const author = blog.createdBy?.fullName || "Anonymous";
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric"
      })
    : "";

  return (
    <div
      onClick={() => navigate(`/blog/${blog._id}`)}
      style={{
        background: "#fff", borderRadius: "10px",
        border: "1px solid #f0f0f0", overflow: "hidden",
        cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,57,70,0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Cover image */}
      {blog.coverImageURL ? (
        <img
          src={blog.coverImageURL}
          alt={title}
          loading="lazy"
          style={{ width: "100%", height: "180px", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{
          width: "100%", height: "180px",
          background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem"
        }}>
          ✍️
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "1.1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "Georgia, serif", fontSize: "1.1rem",
          fontWeight: "700", margin: "0 0 0.5rem",
          color: "#111", lineHeight: "1.4",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {title}
        </h3>
        <p style={{
          color: "#666", fontSize: "0.875rem",
          lineHeight: "1.5", margin: "0 0 1rem", flex: 1,
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {excerpt}
        </p>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", paddingTop: "0.75rem",
          borderTop: "1px solid #f5f5f5",
          fontSize: "0.8rem", color: "#999"
        }}>
          <span>✍️ {author}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
