const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    secure_url: { type: String, required: false },
    public_id: { type: String, required: false },
    resource_type: { type: String, enum: ["image", "video"], required: false },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema({
  media: { type: mongoose.Schema.Types.Mixed, required: false }, // can be object, string, or null
  name: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
