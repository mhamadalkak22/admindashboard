const Admin = require("../models/Admin");
const { Booking } = require("../models/Booking");
const Feedback = require("../models/Feedback");
const Report = require("../models/Report");
const { AccountRecovery } = require("../models/AccountRecovery");
const Blog = require("../models/Blog");

// @desc    Get admin dashboard data
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.json({
      message: "Dashboard data retrieved successfully",
      admin: admin,
      // Add more dashboard data here as needed
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getCounts = async (req, res) => {
  try {
    const bookingsCount = await Booking.countDocuments();
    const feedbacksCount = await Feedback.countDocuments();
    const reportsCount = await Report.countDocuments();
    const accountRecoveriesCount = await AccountRecovery.countDocuments();
    const blogsCount = await Blog.countDocuments();

    res.json({
      success: true,
      data: {
        bookings: bookingsCount,
        feedbacks: feedbacksCount,
        reports: reportsCount,
        accountRecoveries: accountRecoveriesCount,
        blogs: blogsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإحصائيات",
    });
  }
}; 
