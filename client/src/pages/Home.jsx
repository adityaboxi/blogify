import { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/blog")
      .then(res => setBlogs(res.data.blogs))
      .catch(() => setError("Failed to load blogs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={center}>Loading...</p>;
  if (error) return <p style={{ ...center, color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", marginBottom: "0.3rem" }}>
        Latest Posts
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>Stories, ideas and perspectives</p>

      {blogs.length === 0 ? (
        <p style={center}>No blogs yet. Be the first to write one!</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
          {blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}
    </div>
  );
}

const center = { textAlign: "center", padding: "4rem", color: "#888" };
