const Admin = require("../models/Admin");

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

// @desc    Update admin profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminFields = {};
    if (name) adminFields.name = name;
    if (email) adminFields.email = email;

    let admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { $set: adminFields },
      { new: true }
    ).select("-password");

    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
