const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

const Contact = mongoose.model("contacts", schema);

module.exports = Contact;
