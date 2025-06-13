const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String }, // Full content (if needed)
  author: { type: String, required: true },
  image: {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Blog", blogSchema);
