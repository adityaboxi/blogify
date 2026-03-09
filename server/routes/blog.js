const { Router } = require("express");
const cloudinary = require("cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Blog = require("../models/blog");
const { restrictToLoggedInUsersOnly } = require("../middlewares/authentication");

const router = Router();

// Configure Cloudinary v1
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogify",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 630, crop: "fill", quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

// Multer error handler
const handleUpload = (req, res, next) => {
  upload.single("coverImage")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image must be under 5MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message || "File upload error." });
    }
    next();
  });
};

// ✅ Stream all blogs — memory efficient with cursor
router.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");

  let cursor;
  try {
    cursor = Blog.find()
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .lean() // Use lean() for less memory — returns plain JS objects
      .cursor({ batchSize: 10 }); // Process 10 at a time for concurrency

    // Handle client disconnect
    req.on("close", () => {
      if (cursor) cursor.close().catch(() => {});
    });

    cursor.on("data", (blog) => {
      if (!blog || !blog._id) return;
      try {
        res.write(JSON.stringify(blog) + "\n");
      } catch {
        // client disconnected mid-stream
      }
    });

    cursor.on("end", () => {
      try { res.end(); } catch {}
    });

    cursor.on("error", (err) => {
      console.error("Stream cursor error:", err);
      try { res.end(); } catch {}
    });

  } catch (err) {
    console.error("Stream setup error:", err);
    try { res.status(500).end(); } catch {}
  }
});

// Get all blogs (fallback, paginated)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find()
        .populate("createdBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments()
    ]);

    return res.json({ blogs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Get blogs error:", err);
    return res.status(500).json({ error: "Failed to fetch blogs." });
  }
});

// Get single blog
router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ error: "Invalid blog ID." });
    }
    const blog = await Blog.findById(req.params.id)
      .populate("createdBy", "fullName")
      .lean();
    if (!blog) return res.status(404).json({ error: "Blog not found." });
    return res.json({ blog });
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({ error: "Failed to fetch blog." });
  }
});

// Create blog
router.post("/", restrictToLoggedInUsersOnly, handleUpload, async (req, res) => {
  const title = req.body?.title?.trim();
  const body = req.body?.body?.trim();

  if (!title) return res.status(400).json({ error: "Title is required." });
  if (title.length < 3) return res.status(400).json({ error: "Title must be at least 3 characters." });
  if (!body) return res.status(400).json({ error: "Content is required." });
  if (body.length < 10) return res.status(400).json({ error: "Content must be at least 10 characters." });
  if (title.length > 100) return res.status(400).json({ error: "Title must be under 100 characters." });
  if (body.length > 10000) return res.status(400).json({ error: "Content must be under 10,000 characters." });

  try {
    const blog = await Blog.create({
      title,
      body,
      coverImageURL: req.file ? req.file.path : "",
      createdBy: req.user._id || req.user.id,
    });

    const populated = await Blog.findById(blog._id).populate("createdBy", "fullName").lean();
    return res.status(201).json({ blog: populated });
  } catch (err) {
    console.error("Create blog error:", err);
    return res.status(500).json({ error: "Failed to create blog. Please try again." });
  }
});

// Delete blog (owner only)
router.delete("/:id", restrictToLoggedInUsersOnly, async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ error: "Invalid blog ID." });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found." });

    const userId = req.user._id?.toString() || req.user.id?.toString();
    const blogOwner = blog.createdBy?.toString();
    if (userId !== blogOwner) {
      return res.status(403).json({ error: "Not authorized to delete this post." });
    }

    // Delete from Cloudinary too if image exists
    if (blog.coverImageURL) {
      try {
        const publicId = blog.coverImageURL.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`blogify/${publicId}`);
      } catch {
        // Non-critical — just log
        console.log("Could not delete image from Cloudinary");
      }
    }

    await blog.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete blog error:", err);
    return res.status(500).json({ error: "Failed to delete blog." });
  }
});

module.exports = router;
