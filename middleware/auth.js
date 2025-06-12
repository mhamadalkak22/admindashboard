const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.header("Authorization");

  // Check if no auth header
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    // Get token from Bearer string
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add admin from payload
    req.admin = decoded.admin;

    // If it's not the static admin, ensure the admin exists in the database
    if (req.admin.id !== "static-admin") {
      // The database check will happen in the route handlers
      if (!req.admin.id) {
        return res.status(401).json({ message: "Invalid token structure" });
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
