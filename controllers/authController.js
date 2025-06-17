const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

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
      return res.status(400).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    // Check password using the comparePassword method
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    // Create JWT payload
    const payload = {
      admin: {
        id: admin._id,
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
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");

    // Check if no auth header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Get token from Bearer string
    const token = authHeader.split(" ")[1];

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Log the logout action
    console.log(`Admin ${req.admin.email} logged out at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};
