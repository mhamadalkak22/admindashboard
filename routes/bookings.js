const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createBooking,
  getAllBookings,
  getBookingById,
} = require("../controllers/bookingController");

// Public routes (no authentication needed)
router.post("/", createBooking); // Public - needed for submitting bookings

// Protected routes (Admin only)
router.get("/", auth, getAllBookings); // Admin only - for viewing all bookings (paginated)
router.get("/:id", auth, getBookingById); // Admin only - for viewing a specific booking

module.exports = router;
