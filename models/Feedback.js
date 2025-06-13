const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
    resource_type: { type: String, enum: ["image", "video"], required: true },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema({
  media: mediaSchema, // either image or video
  name: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
