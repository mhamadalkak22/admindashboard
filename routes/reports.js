const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  submitReport,
  getAllReports,
  getReportById,
  deleteReport,
} = require("../controllers/reportController");

// Configure multer upload fields
const uploadFields = upload.fields([
  { name: "idImage", maxCount: 1 },
  { name: "screenshots", maxCount: 5 },
  { name: "additionalDocuments", maxCount: 3 },
  { name: "identityProof", maxCount: 3 },
]);

// Public routes
router.post("/", uploadFields, submitReport);

// Protected routes (Admin only)
router.get("/", auth, getAllReports);
router.get("/:id", auth, getReportById);
router.delete("/:id", auth, deleteReport);

module.exports = router;
