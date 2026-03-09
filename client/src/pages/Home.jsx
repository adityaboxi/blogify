import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL || "";

    fetch(`${baseURL}/api/blog/stream`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to stream blogs");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        setLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Process all complete lines
          buffer = lines.pop(); // keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              try {
                const blog = JSON.parse(line);
                setBlogs((prev) => [...prev, blog]);
              } catch {
                // skip malformed line
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const blog = JSON.parse(buffer);
            setBlogs((prev) => [...prev, blog]);
          } catch {}
        }
      })
      .catch(() => {
        setError("Failed to load blogs. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={center}>
      <div style={spinner} />
      <p style={{ color: "#888", marginTop: "1rem" }}>Loading blogs...</p>
    </div>
  );

  if (error) return <p style={{ ...center, color: "#c00" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontFamily: "Georgia, serif", marginBottom: "0.3rem" }}>
        Latest Posts
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        Stories, ideas and perspectives
      </p>

      {blogs.length === 0 && !loading ? (
        <p style={center}>No blogs yet. Be the first to write one!</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}

const center = {
  display: "flex", flexDirection: "column",
  justifyContent: "center", alignItems: "center",
  padding: "4rem", color: "#888",
};

const spinner = {
  width: "36px", height: "36px",
  border: "3px solid #e5e5e5",
  borderTop: "3px solid #111",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
