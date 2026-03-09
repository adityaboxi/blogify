import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <div style={{
      border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden",
      transition: "box-shadow 0.2s", background: "#fff",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {blog.coverImageURL && (
        <img
          src={blog.coverImageURL}
          alt={blog.title}
          style={{ width: "100%", height: "180px", objectFit: "cover" }}
        />
      )}
      <div style={{ padding: "1.2rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "600", marginBottom: "0.5rem", color: "#111" }}>
          {blog.title}
        </h3>
        <p style={{ color: "#777", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: "1.5" }}>
          {blog.body?.substring(0, 120) ?? ""}...
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#aaa", fontSize: "0.8rem" }}>
            {blog.createdBy?.fullName || "Unknown"}
          </span>
          <Link to={`/blog/${blog._id}`} style={{
            fontSize: "0.85rem", color: "#111", fontWeight: "600",
            borderBottom: "1px solid #111",
          }}>
            Read →
          </Link>
        </div>
      </div>
    </div>
  );
}
