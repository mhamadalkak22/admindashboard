const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

// @desc    Authenticate admin & get token
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // Validate password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // Create JWT payload
    const payload = {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          message: "تم تسجيل الدخول بنجاح",
          token_type: "Bearer",
          access_token: token,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Log the logout action
    console.log(`Admin logged out at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الخروج",
    });
  }
};
