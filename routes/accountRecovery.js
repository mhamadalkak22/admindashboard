const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  submitRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/accountRecoveryController");

// Public routes
router.post("/", upload.array("identityDocuments", 5), submitRequest);

// Protected routes (Admin only)
router.get("/", auth, getAllRequests);
router.get("/:id", auth, getRequestById);
router.put("/:id", auth, updateRequestStatus);
router.delete("/:id", auth, deleteRequest);

module.exports = router;
