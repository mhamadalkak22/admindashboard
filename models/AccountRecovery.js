const mongoose = require("mongoose");

const SOCIAL_PLATFORMS = {
  TWITTER: "Twitter",
  SNAPCHAT: "Snapchat",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

const accountRecoverySchema = new mongoose.Schema(
  {
    // Platform Selection
    platform: {
      type: String,
      required: [true, "Platform is required"],
      enum: Object.values(SOCIAL_PLATFORMS),
    },

    // Account Information
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    // Personal Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    idNumber: {
      type: String,
      required: [true, "ID number is required"],
      trim: true,
    },

    // Identity Verification
    identityDocuments: {
      type: [
        {
          secure_url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      validate: [
        (arr) => arr.length > 0,
        "At least one identity document is required",
      ],
    },

    // Additional Information
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
accountRecoverySchema.index({ platform: 1, status: 1 });
accountRecoverySchema.index({ createdAt: -1 });

module.exports = {
  AccountRecovery: mongoose.model("AccountRecovery", accountRecoverySchema),
  SOCIAL_PLATFORMS,
};
