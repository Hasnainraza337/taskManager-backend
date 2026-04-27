const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["task", "security", "alert"],
      default: "task",
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", schema);
module.exports = { Notification };
