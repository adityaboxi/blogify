import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/api/blog/${id}`)
      .then(res => setBlog(res.data.blog))
      .catch(() => setError("Blog not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`/api/blog/${id}`);
      navigate("/");
    } catch {
      alert("Failed to delete blog.");
    }
  };

  if (loading) return <p style={center}>Loading...</p>;
  if (error) return <p style={{ ...center, color: "#c00" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link to="/" style={{ color: "#888", fontSize: "0.9rem" }}>← Back to posts</Link>

      {blog.coverImageURL && (
        <img src={blog.coverImageURL} alt={blog.title}
          style={{ width: "100%", height: "360px", objectFit: "cover", borderRadius: "8px", margin: "1.5rem 0" }} />
      )}

      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", marginBottom: "0.5rem" }}>
        {blog.title}
      </h1>
      <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "2rem" }}>
        By {blog.createdBy?.fullName || "Unknown"} · {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      <div style={{ lineHeight: "1.8", color: "#333", whiteSpace: "pre-wrap" }}>
        {blog.body}
      </div>

      {user && user.id === blog.createdBy?._id && (
        <button onClick={handleDelete}
          style={{ marginTop: "2rem", padding: "0.6rem 1.2rem", background: "#c00", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Delete Post
        </button>
      )}
    </div>
  );
}

const center = { textAlign: "center", padding: "4rem", color: "#888" };
