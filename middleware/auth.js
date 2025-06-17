const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.header("Authorization");

  // Check if no auth header
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token format" 
    });
  }

  try {
    // Get token from Bearer string
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get admin from database
    const admin = await Admin.findById(decoded.admin.id).select("-password");
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Add admin to request object
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false,
      message: "Token is not valid" 
    });
  }
};

module.exports = auth;
