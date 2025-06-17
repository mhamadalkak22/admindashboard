const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const { login, logout } = require("../controllers/authController");

router.post(
  "/login",
  [
    check("email", "البريد الإلكتروني غير صالح").isEmail(),
    check("password", "كلمة المرور مطلوبة").exists(),
  ],
  login
);

router.post("/logout", auth, logout);

module.exports = router;
