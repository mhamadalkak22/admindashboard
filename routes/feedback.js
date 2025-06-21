const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
  updateFeedback,
} = require("../controllers/feedbackController");

// Configure multer upload
const uploadMedia = upload.single("media");

// Public routes
router.get("/", getAllFeedback);

// Protected routes (Admin only)
router.post("/", auth, uploadMedia, submitFeedback);
router.get("/:id", auth, getFeedbackById);
router.put("/:id", auth, uploadMedia, updateFeedback);
router.delete("/:id", auth, deleteFeedback);

module.exports = router;
