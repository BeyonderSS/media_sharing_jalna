import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  // Physical or cloud path of stored media
  mediaPath: {
    type: String,
    required: true
  },

  // Name/title (optional)
  title: {
    type: String,
    default: ""
  },

  // File metadata optional (size, type)
  size: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: ""
  },

  // When stored
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
