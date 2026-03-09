const { Router } = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Blog = require("../models/blog");
const { restrictToLoggedInUsersOnly } = require("../middlewares/authentication");

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogify",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 630, crop: "fill" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });
    return res.json({ blogs });
  } catch {
    return res.status(500).json({ error: "Failed to fetch blogs." });
  }
});

// Get single blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy", "fullName");
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    return res.json({ blog });
  } catch {
    return res.status(500).json({ error: "Failed to fetch blog." });
  }
});

// Create blog (auth required)
router.post(
  "/",
  restrictToLoggedInUsersOnly,
  upload.single("coverImage"),
  async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body)
      return res.status(400).json({ error: "Title and body are required." });
    try {
      const blog = await Blog.create({
        title,
        body,
        coverImageURL: req.file ? req.file.path : "",
        createdBy: req.user.id,
      });
      return res.status(201).json({ blog });
    } catch {
      return res.status(500).json({ error: "Failed to create blog." });
    }
  }
);

// Delete blog (only owner)
router.delete("/:id", restrictToLoggedInUsersOnly, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    if (blog.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized." });
    await blog.deleteOne();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete blog." });
  }
});

module.exports = router;