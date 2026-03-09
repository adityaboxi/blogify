import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Invalid blog ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    axios.get(`/api/blog/${id}`)
      .then(res => {
        if (cancelled) return;
        if (!res.data?.blog) {
          setError("Blog not found.");
        } else {
          setBlog(res.data.blog);
        }
      })
      .catch(err => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setError("Blog not found.");
        } else {
          setError("Failed to load blog. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/blog/${id}`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete blog.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: "720px", margin: "3rem auto", padding: "0 1rem" }}>
      <div style={{ background: "#f5f5f5", height: "300px", borderRadius: "10px", marginBottom: "1.5rem", animation: "shimmer 1.5s infinite" }} />
      <div style={{ height: "24px", background: "#f5f5f5", borderRadius: "4px", marginBottom: "1rem", width: "70%" }} />
      <div style={{ height: "16px", background: "#f5f5f5", borderRadius: "4px", marginBottom: "0.5rem" }} />
      <div style={{ height: "16px", background: "#f5f5f5", borderRadius: "4px", marginBottom: "0.5rem", width: "85%" }} />
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: "720px", margin: "3rem auto", padding: "0 1rem", textAlign: "center" }}>
      <p style={{ fontSize: "3rem" }}>😕</p>
      <p style={{ color: "#c00", marginBottom: "1rem" }}>{error}</p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "#e63946", color: "#fff", border: "none",
          borderRadius: "6px", padding: "0.6rem 1.5rem",
          cursor: "pointer", fontSize: "0.9rem"
        }}
      >
        Back to Home
      </button>
    </div>
  );

  if (!blog) return null;

  const title = blog.title?.trim() || "Untitled Post";
  const body = blog.body?.trim() || "No content available.";
  const author = blog.createdBy?.fullName || "Anonymous";
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
      })
    : "";
  const isOwner = user && blog.createdBy && (
    user._id === blog.createdBy._id ||
    user._id === blog.createdBy ||
    user.id === blog.createdBy._id ||
    user.id === blog.createdBy
  );

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "none", border: "none", color: "#e63946",
          cursor: "pointer", fontSize: "0.9rem", padding: "0",
          marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.3rem"
        }}
      >
        ← Back to Home
      </button>

      {/* Cover image */}
      {blog.coverImageURL && (
        <img
          src={blog.coverImageURL}
          alt={title}
          style={{
            width: "100%", maxHeight: "400px", objectFit: "cover",
            borderRadius: "10px", marginBottom: "1.5rem"
          }}
          onError={e => { e.target.style.display = "none"; }}
        />
      )}

      {/* Title */}
      <h1 style={{
        fontFamily: "Georgia, serif", fontSize: "2rem",
        lineHeight: "1.3", marginBottom: "0.75rem", color: "#111"
      }}>
        {title}
      </h1>

      {/* Meta */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0",
        marginBottom: "1.5rem", fontSize: "0.875rem", color: "#888",
        flexWrap: "wrap", gap: "0.5rem"
      }}>
        <span>✍️ {author}</span>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {date && <span>📅 {date}</span>}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: deleting ? "#ccc" : "#fff0f0",
                color: "#c00", border: "1px solid #ffcccc",
                borderRadius: "6px", padding: "0.3rem 0.75rem",
                cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "0.8rem", fontWeight: "600"
              }}
            >
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{
        lineHeight: "1.8", fontSize: "1.05rem",
        color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word"
      }}>
        {body}
      </div>
    </div>
  );
}
