const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    title: { type: String, required: true },
    dueDate: { type: String, default: "" },
    description: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false },
    imageURL: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
  },
  { timestamps: true },
);

const Todos = mongoose.model("todos", schema);

module.exports = Todos;
