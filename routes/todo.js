const express = require("express");
const multer = require("multer");
const router = express.Router();
const { verifyToken } = require("../middleWare/verifyToken");
const Todos = require("../models/todos");
const { cloudinary } = require("../config/cloudinary");
const { Notification } = require("../models/notification");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create ToDo Api route
router.post(
  "/add-todo",
  upload.fields([{ name: "image" }]),
  verifyToken,
  async (req, res) => {
    try {
      let imageURL = "";
      let imagePublicId = "";
      if (req.files["image"] && req.files["image"][0]) {
        await new Promise((resolve, reject) => {
          const uploadtStream = cloudinary.uploader.upload_stream(
            { folder: "images/" },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              imageURL = result.secure_url;
              imagePublicId = result.public_id;
              resolve();
            },
          );
          uploadtStream.end(req.files["image"][0].buffer);
        });
      }

      const { title, dueDate, description } = req.body;
      const { uid } = req;

      const newTodo = {
        id:
          Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2),
        uid,
        title,
        dueDate,
        description,
        imageURL,
        imagePublicId,
      };

      const todo = new Todos(newTodo);
      await todo.save();

      const newNotification = new Notification({
        recipient: uid,
        message: `New Task Added: "${title}" is scheduled for ${dueDate || "no date"}.`,
        type: "task",
      });
      await newNotification.save();

      res.status(201).json({ message: "A new Todo Added Successfully", todo });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
);

// Get ALl ToDo Api route
router.get("/allTodos", verifyToken, async (req, res) => {
  try {
    const todos = await Todos.find();

    res.status(200).json({ todos });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get specific User ToDo Api route
router.get("/myTodos", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const todos = await Todos.find({ uid });
    res.status(200).json({ todos });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get  single ToDo Api route
router.get("/singleTodo/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todos.findOne({ id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Delete ToDo Api route
router.delete("/deleteTodo/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req;
    const deletedTodo = await Todos.findOneAndDelete({ id, uid });
    if (!deletedTodo) {
      return res
        .status(404)
        .json({ message: "Todo not found or unauthorized" });
    }

    const newNotification = new Notification({
      recipient: uid,
      message: `Task Deleted: "${deletedTodo.title}" has been removed.`,
      type: "task",
    });
    await newNotification.save();
    res.status(200).json({ message: "Todo Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update ToDo Api route
router.patch("/updateTodo/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req;
    const { title, dueDate, description } = req.body;
    const newTodo = { title, dueDate, description };
    const updateTodo = await Todos.findOneAndUpdate({ id }, newTodo, {
      returnDocument: "after",
    });
    if (!updateTodo) {
      return res
        .status(404)
        .json({ message: "Todo not found or unauthorized" });
    }
    const newNotification = new Notification({
      recipient: uid,
      message: `Task Updated: "${updateTodo.title}" was modified successfully.`,
      type: "task",
    });
    await newNotification.save();
    res
      .status(200)
      .json({ message: "Todo Updated Successfully", todo: updateTodo });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Backend Route Update
router.get("/recentTodos", verifyToken, async (req, res) => {
  const { uid } = req;
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todos = await Todos.find({
      uid: uid,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      todos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
module.exports = router;
