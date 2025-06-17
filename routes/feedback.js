const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} = require("../controllers/feedbackController");

// Configure multer upload
const uploadMedia = upload.single("media");

// Public routes
router.post("/", auth, uploadMedia, submitFeedback);

// Protected routes (Admin only)
router.get("/", getAllFeedback);
router.get("/:id", auth, getFeedbackById);
router.delete("/:id", auth, deleteFeedback);

module.exports = router;
