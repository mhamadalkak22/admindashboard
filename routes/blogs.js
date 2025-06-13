const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

// Configure multer upload
const uploadImage = upload.single("image");

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes (Admin only)
router.post("/", auth, uploadImage, createBlog);
router.put("/:id", auth, uploadImage, updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
