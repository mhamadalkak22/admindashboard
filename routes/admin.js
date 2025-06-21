const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getDashboardData,
  getCounts,
} = require("../controllers/adminController");

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get("/dashboard", auth, getDashboardData);
router.get("/counts", auth, getCounts);


module.exports = router;
