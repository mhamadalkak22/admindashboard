const mongoose = require("mongoose");

// Define available platforms
const PLATFORMS = {
  instagram: "انستغرام",
  facebook: "فيسبوك",
  twitter: "تويتر",
  tiktok: "تيك توك",
  snapchat: "سناب شات",
  whatsapp: "واتساب"
};

// Define service types
const SERVICE_TYPES = {
  APP_DESIGN: "تصميم تطبيقات",
  WEBSITE_DESIGN: "تصميم موقع",
  ACCOUNT_REPORT: "الإبلاغ عن حساب",
  ACCOUNT_RECOVERY: "استرجاع الحساب",
  ACCOUNT_VERIFICATION: "توثيق الحساب",
  PAID_ADS: "إعلانات ممولة",
  BUY_ACCOUNTS: "شراء حسابات",
  WHATSAPP_CAMPAIGNS: "حملات واتساب",
  HASHTAG_BOOST: "رفع هاشتاقات",
  SOCIAL_MANAGEMENT: "إدارة حسابات التواصل",
};

// Define available appointment times
const AVAILABLE_TIMES = [
  "9:00 ص",
  "9:30 ص",
  "10:00 ص",
  "10:30 ص",
  "11:00 ص",
  "11:30 ص",
  "12:00 م",
  "12:30 م",
  "1:00 م",
  "2:00 م",
  "5:00 م",
  "5:30 م",
  "6:00 م",
  "6:30 م",
  "7:00 م",
  "7:30 م",
  "8:00 م",
  "8:30 م",
  "9:00 م",
];

const bookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    platform: {
      type: String,
      required: true,
      enum: Object.keys(PLATFORMS),
    },
    serviceType: {
      type: String,
      required: true,
      enum: Object.values(SERVICE_TYPES),
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      enum: AVAILABLE_TIMES,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Booking: mongoose.model("Booking", bookingSchema),
  SERVICE_TYPES,
  AVAILABLE_TIMES,
  PLATFORMS,
};
