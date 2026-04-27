const express = require("express");
const router = express.Router();
const { Notification } = require("../models/notification");
const { verifyToken } = require("../middleWare/verifyToken");

router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const notifications = await Notification.find({ recipient: uid })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    await Notification.updateMany(
      { recipient: uid, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification" });
  }
});

module.exports = router;
