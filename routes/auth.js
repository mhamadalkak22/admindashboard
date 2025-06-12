const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const { login, logout } = require("../controllers/authController");

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  "/login",
  [
    check("email", "البريد الإلكتروني غير صالح").isEmail(),
    check("password", "كلمة المرور مطلوبة").exists(),
  ],
  login
);

// @route   POST api/auth/logout
// @desc    Logout admin
// @access  Private
router.post("/logout", auth, logout);

module.exports = router;
