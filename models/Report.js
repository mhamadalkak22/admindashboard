const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema({
  // Step 1: Fake Account Info
  fakeAccount: {
    username: { type: String, required: true },
    platform: {
      type: String,
      enum: ["facebook", "instagram", "twitter", "tiktok", "snapchat"],
      required: true,
    },
    accountLink: { type: String, required: true },
    description: { type: String, required: true },
  },

  // Step 2: Supporting Documents
  documents: {
    idImage: fileSchema, // Single file object
    screenshots: [fileSchema], // Array of image/video files
    additionalDocuments: [fileSchema], // Optional files
  },

  // Step 3: Real Identity Info
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    occupation: {
      type: String,
      enum: ["business", "employee", "student", "other"],
      required: true,
    },
    idNumber: { type: String, required: true },
    idExpiry: { type: Date, required: true },
    identityProof: [fileSchema], // Up to 3 files
  },

  // Optional real social media
  realAccounts: {
    facebook: { type: String },
    instagram: { type: String },
    snapchat: { type: String },
    tiktok: { type: String },
    website: { type: String },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
