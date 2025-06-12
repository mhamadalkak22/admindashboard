const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getDashboardData,
  updateProfile,
} = require("../controllers/adminController");

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get("/dashboard", auth, getDashboardData);

// @route   PUT api/admin/profile
// @desc    Update admin profile
// @access  Private
router.put("/profile", auth, updateProfile);

module.exports = router;
