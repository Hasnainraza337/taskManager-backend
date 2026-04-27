const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: "Active" },
    roles: { type: [String], default: ["user"] },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    resetToken: { type: String, default: "" },
  },
  { timestamps: true },
);

const Users = mongoose.model("users", schema);

module.exports = Users;
