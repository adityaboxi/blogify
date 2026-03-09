import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddBlog() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", body: "" });
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    setCoverImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Blog title is required.");
    if (form.title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (!form.body.trim()) return setError("Blog content is required.");
    if (form.body.trim().length < 10) return setError("Content must be at least 10 characters.");
    if (!agreed) return setError("You must agree to the terms before publishing.");

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("body", form.body.trim());
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await axios.post("/api/blog", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 second timeout for image upload
      });
      navigate(`/blog/${res.data.blog._id}`);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setError("Upload timed out. Try a smaller image or no image.");
      } else {
        setError(err.response?.data?.error || "Failed to create blog. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "Georgia, serif", marginBottom: "0.3rem", fontSize: "1.8rem" }}>
        Write a Post
      </h1>
      <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Share your thoughts with the world
      </p>

      {error && (
        <div style={{
          background: "#fff0f0", border: "1px solid #ffcccc",
          borderRadius: "6px", padding: "0.75rem 1rem",
          color: "#c00", fontSize: "0.875rem", marginBottom: "1.2rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Post Title *</label>
          <input
            style={input}
            type="text"
            placeholder="Enter a compelling title..."
            value={form.title}
            onChange={e => { setForm({ ...form, title: e.target.value }); setError(""); }}
            maxLength={100}
            disabled={loading}
          />
          <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
            {form.title.length}/100 characters
          </span>
        </div>

        {/* Cover Image */}
        <div>
          <label style={labelStyle}>Cover Image (optional, max 5MB)</label>
          {!preview ? (
            <div
              style={{
                border: "2px dashed #ddd", borderRadius: "8px",
                padding: "1.5rem", textAlign: "center", cursor: "pointer",
                background: "#fafafa", transition: "border-color 0.2s",
              }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#e63946"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#ddd"}
            >
              <p style={{ color: "#888", fontSize: "0.875rem" }}>
                📷 Click to upload image
              </p>
              <p style={{ color: "#bbb", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                JPG, PNG, WEBP supported
              </p>
            </div>
          ) : (
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%", height: "200px", objectFit: "cover",
                  borderRadius: "8px", border: "1px solid #e5e5e5"
                }}
              />
              <button
                onClick={handleRemoveImage}
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "#e63946", color: "#fff", border: "none",
                  borderRadius: "50%", width: "28px", height: "28px",
                  fontSize: "0.9rem", cursor: "pointer", fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}
                title="Remove image"
              >
                ✕
              </button>
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.4rem" }}>
                {coverImage?.name} ({(coverImage?.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            disabled={loading}
          />
        </div>

        {/* Body */}
        <div>
          <label style={labelStyle}>Content *</label>
          <textarea
            style={{ ...input, minHeight: "280px", resize: "vertical", lineHeight: "1.6" }}
            placeholder="Write your blog content here..."
            value={form.body}
            onChange={e => { setForm({ ...form, body: e.target.value }); setError(""); }}
            maxLength={10000}
            disabled={loading}
          />
          <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
            {form.body.length}/10000 characters
          </span>
        </div>

        {/* Terms */}
        <div style={{
          background: "#fff8f8", border: "1px solid #ffe0e0",
          borderRadius: "8px", padding: "1rem"
        }}>
          <label style={{ display: "flex", gap: "0.75rem", cursor: "pointer", alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setError(""); }}
              style={{ marginTop: "3px", accentColor: "#e63946" }}
              disabled={loading}
            />
            <span style={{ fontSize: "0.875rem", color: "#444", lineHeight: "1.5" }}>
              I understand that this blog post will be <strong>publicly visible</strong> to all visitors.
              I confirm this content is original, appropriate, and does not violate any laws.
              I agree to Blogify's community guidelines.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "0.9rem",
            background: loading ? "#ccc" : "#e63946",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "1rem", fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Publishing... (may take up to 30s for images)" : "Publish Post"}
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "0.875rem",
  fontWeight: "600", color: "#333", marginBottom: "0.4rem"
};
const input = {
  padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px",
  fontSize: "1rem", width: "100%", outline: "none",
  background: "#fff", boxSizing: "border-box",
  transition: "border-color 0.2s",
};
