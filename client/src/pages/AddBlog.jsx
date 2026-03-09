import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddBlog() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", body: "" });
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("body", form.body);
      if (coverImage) formData.append("coverImage", coverImage);
      const res = await axios.post("/api/blog", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/blog/${res.data.blog._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "Georgia, serif", marginBottom: "2rem" }}>Write a Post</h1>
      {error && <p style={{ color: "#c00", marginBottom: "1rem" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <input style={input} type="text" placeholder="Post title"
          value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <div>
          <label style={{ color: "#666", fontSize: "0.875rem", display: "block", marginBottom: "0.4rem" }}>
            Cover Image (optional)
          </label>
          <input style={{ ...input, padding: "0.5rem" }} type="file"
            accept="image/*" onChange={e => setCoverImage(e.target.files[0])} />
        </div>
        <textarea style={{ ...input, minHeight: "280px", resize: "vertical" }}
          placeholder="Write your post..."
          value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required />
        <button style={submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}

const input = { padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "1rem", width: "100%", outline: "none", background: "#fff" };
const submitBtn = { padding: "0.85rem", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600" };
