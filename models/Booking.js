const mongoose = require("mongoose");

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

const AVAILABLE_TIMES = [
  "8:00 ص",
  "8:30 ص",
  "9:00 ص",
  "9:30 ص",
  "10:00 ص",
  "10:30 ص",
  "11:00 ص",
  "11:30 ص",
  "12:00 م",
  "12:30 م",
  "1:00 م",
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
    // Personal Information
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },

    // Service Details
    serviceType: {
      type: String,
      required: true,
      enum: Object.values(SERVICE_TYPES),
    },

    // Appointment Details
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      enum: AVAILABLE_TIMES,
    },

    // Additional Information
    additionalNotes: {
      type: String,
      required: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add timestamps for better tracking
    timestamps: true,
    // Ensure virtuals are included in JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export both the model and constants
module.exports = {
  Booking: mongoose.model("Booking", bookingSchema),
  SERVICE_TYPES,
  AVAILABLE_TIMES,
};
