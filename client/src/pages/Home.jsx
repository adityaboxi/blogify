import { useEffect, useState, useCallback, useRef } from "react";
import BlogCard from "../components/BlogCard";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const abortRef = useRef(null);

  const loadBlogs = useCallback(async () => {
    // Abort any previous fetch
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");
    setBlogs([]);

    const baseURL = import.meta.env.VITE_API_URL || "";

    try {
      const res = await fetch(`${baseURL}/api/blog/stream`, {
        credentials: "include",
        signal: abortRef.current.signal,
        headers: {
          Authorization: localStorage.getItem("token")
            ? `Bearer ${localStorage.getItem("token")}`
            : "",
        },
      });

      if (!res.ok) throw new Error("Failed to load blogs");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const blog = JSON.parse(line);
            if (blog && blog._id) {
              setBlogs(prev => {
                // Prevent duplicates
                if (prev.find(b => b._id === blog._id)) return prev;
                return [...prev, blog];
              });
            }
          } catch {
            // skip malformed line
          }
        }
      }

      // Handle remaining buffer
      if (buffer.trim()) {
        try {
          const blog = JSON.parse(buffer);
          if (blog && blog._id) {
            setBlogs(prev => {
              if (prev.find(b => b._id === blog._id)) return prev;
              return [...prev, blog];
            });
          }
        } catch {}
      }

    } catch (err) {
      if (err.name === "AbortError") return;
      setError("Failed to load blogs. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
    return () => abortRef.current?.abort();
  }, [loadBlogs]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
        borderRadius: "12px", padding: "2.5rem 2rem",
        marginBottom: "2.5rem", color: "#fff"
      }}>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: "2.2rem",
          margin: "0 0 0.5rem", fontWeight: "700"
        }}>
          Welcome to Blogify
        </h1>
        <p style={{ opacity: 0.9, margin: "0 0 1.5rem", fontSize: "1rem" }}>
          A space to read, write, and connect through stories.
        </p>
        <button
          onClick={() => setShowTerms(true)}
          style={{
            background: "rgba(255,255,255,0.2)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)", borderRadius: "6px",
            padding: "0.5rem 1rem", fontSize: "0.875rem", cursor: "pointer",
            backdropFilter: "blur(4px)"
          }}
        >
          📋 Community Guidelines & Privacy
        </button>
      </div>

      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", margin: 0 }}>
            Latest Posts
          </h2>
          <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "0.2rem" }}>
            Stories, ideas and perspectives
          </p>
        </div>
        {!loading && blogs.length > 0 && (
          <span style={{ color: "#888", fontSize: "0.875rem" }}>
            {blogs.length} post{blogs.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: "#f9f9f9", borderRadius: "10px",
              padding: "1rem", animation: "shimmer 1.5s infinite"
            }}>
              <div style={{ height: "160px", background: "#eee", borderRadius: "6px", marginBottom: "1rem" }} />
              <div style={{ height: "16px", background: "#eee", borderRadius: "4px", marginBottom: "0.5rem", width: "80%" }} />
              <div style={{ height: "12px", background: "#eee", borderRadius: "4px", width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          textAlign: "center", padding: "3rem",
          background: "#fff0f0", borderRadius: "10px",
          border: "1px solid #ffcccc"
        }}>
          <p style={{ color: "#c00", marginBottom: "1rem" }}>⚠️ {error}</p>
          <button onClick={loadBlogs} style={{
            background: "#e63946", color: "#fff", border: "none",
            borderRadius: "6px", padding: "0.6rem 1.5rem",
            cursor: "pointer", fontSize: "0.9rem"
          }}>
            Try Again
          </button>
        </div>
      )}

      {/* Blogs grid — streams in one by one */}
      {!loading && !error && blogs.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem",
          background: "#f9f9f9", borderRadius: "10px"
        }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✍️</p>
          <p style={{ color: "#888" }}>No blogs yet. Be the first to write one!</p>
        </div>
      )}

      {blogs.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {blogs.map((blog, i) => (
            <div
              key={blog._id}
              style={{
                animation: "fadeIn 0.4s ease forwards",
                animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                opacity: 0
              }}
            >
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem", backdropFilter: "blur(4px)"
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowTerms(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: "12px",
            maxWidth: "560px", width: "100%",
            maxHeight: "80vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            {/* Modal header */}
            <div style={{
              padding: "1.5rem", borderBottom: "1px solid #f0f0f0",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "1.3rem" }}>
                📋 Community Guidelines & Privacy
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  background: "#f0f0f0", border: "none", borderRadius: "50%",
                  width: "32px", height: "32px", cursor: "pointer",
                  fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >✕</button>
            </div>

            {/* Modal content */}
            <div style={{ padding: "1.5rem", overflowY: "auto", lineHeight: "1.7", fontSize: "0.9rem", color: "#444" }}>
              <Section title="📢 Public Content">
                All blog posts published on Blogify are <strong>publicly visible</strong> to everyone on the internet — no account is needed to read them. Please do not post private or sensitive personal information.
              </Section>

              <Section title="📧 Email Usage">
                Your email address is collected for:
                <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
                  <li>Account creation and login</li>
                  <li>Sending one-time password (OTP) codes for password reset</li>
                  <li>Account security notifications</li>
                </ul>
                We <strong>do not</strong> sell your email or use it for marketing.
              </Section>

              <Section title="✍️ Content Guidelines">
                By posting on Blogify, you agree that your content:
                <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
                  <li>Is your original work or you have rights to share it</li>
                  <li>Does not contain hate speech, harassment, or illegal content</li>
                  <li>Does not include private information about others without consent</li>
                  <li>Is appropriate for a general audience</li>
                </ul>
              </Section>

              <Section title="🔒 Password & Security">
                Your password is securely hashed and never stored in plain text. OTP codes expire after <strong>10 minutes</strong> for your security. We recommend using a strong, unique password.
              </Section>

              <Section title="🗑️ Content Removal">
                You can delete your own posts at any time. Blogify reserves the right to remove content that violates these guidelines without notice.
              </Section>

              <div style={{
                background: "#fff5f5", border: "1px solid #ffe0e0",
                borderRadius: "8px", padding: "1rem", marginTop: "1rem",
                fontSize: "0.8rem", color: "#888"
              }}>
                This is a student project by Aditya Boxi (NIT Raipur). By using Blogify you accept these guidelines.
                Last updated: March 2026.
              </div>
            </div>

            <div style={{ padding: "1rem", borderTop: "1px solid #f0f0f0" }}>
              <button
                onClick={() => setShowTerms(false)}
                style={{
                  width: "100%", padding: "0.8rem",
                  background: "#e63946", color: "#fff",
                  border: "none", borderRadius: "8px",
                  fontSize: "1rem", fontWeight: "600", cursor: "pointer"
                }}
              >
                Got it ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

