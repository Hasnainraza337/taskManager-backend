const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/auth");
const router = express.Router();
const { verifyToken } = require("../middleWare/verifyToken");
const { cloudinary } = require("../config/cloudinary");
const { sendEmail } = require("../utils/sendEmail");
const { Notification } = require("../models/notification");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Registration API  route
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (fullName.trim().length < 3) {
      return res
        .status(401)
        .json({ message: "FullName must be at least 3 characters." });
    }

    if (!email.match(process.env.EmailRegex)) {
      return res.status(401).json({ message: "Invalid email address." });
    }
    if (password.trim().length < 6) {
      return res
        .status(401)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ message: "Email already in use, try another one" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const uid =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const newUserData = {
      uid,
      fullName,
      email,
      password: hashPassword,
    };
    const newUser = new Users(newUserData);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Login API route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.match(process.env.EmailRegex)) {
      return res.status(401).json({ message: "Invalid email or password ." });
    }
    if (!password || password.trim().length < 6) {
      return res
        .status(401)
        .json({ message: "Password must be at least 6 characters." });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { uid } = user;
      const token = jwt.sign({ uid }, process.env.Secret_Key, {
        expiresIn: "1d",
      });
      res.status(200).json({ message: "Login successful", token });
    } else {
      return res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get LoggedIn User Profile API Route
router.get("/user-profile", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const user = await Users.findOne({ uid }).select("-password").exec();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User Profile", user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update User Profile API Route

router.patch(
  "/update-profile",
  verifyToken,
  upload.fields([{ name: "avatar" }]),
  async (req, res) => {
    try {
      const { uid } = req;
      const { fullName } = req.body;

      if (!fullName || fullName.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "FullName must be at least 3 characters." });
      }

      const existingUser = await Users.findOne({ uid });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let avatarURL = existingUser.avatar;
      let avatarPublicId = existingUser.avatarPublicId;

      if (req.files && req.files["avatar"] && req.files["avatar"][0]) {
        if (existingUser.avatarPublicId) {
          await cloudinary.uploader.destroy(existingUser.avatarPublicId);
        }

        await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "avatars/" },
            (error, result) => {
              if (error) return reject(error);
              avatarURL = result.secure_url;
              avatarPublicId = result.public_id;
              resolve();
            },
          );
          uploadStream.end(req.files["avatar"][0].buffer);
        });
      }

      const updateObj = {
        fullName: fullName.trim(),
        avatar: avatarURL,
        avatarPublicId: avatarPublicId,
      };

      const updatedUser = await Users.findOneAndUpdate({ uid }, updateObj, {
        returnDocument: "after",
      });

      const securityNotification = new Notification({
        recipient: uid,
        message: "Your profile information updated successfully.",
        type: "security",
      });
      await securityNotification.save();

      res.status(200).json({
        message: "User Profile Updated Successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  },
);

// Delete User Profile API Route
router.delete("/delete-user", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const user = await Users.findOne({ uid });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    await Users.findOneAndDelete({ uid });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get All Users List API Route
router.get("/allUsers", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const currentUser = await Users.findOne({ uid }).select("-password").exec();
    if (!currentUser.roles.includes("super-admin")) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await Users.find({}).select("-password").exec();

    res.status(200).json({ message: "All Users List", users });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// delete user profile image
router.delete("/deleteProfileImage", verifyToken, async (req, res) => {
  try {
    const { uid } = req;
    const user = await Users.findOne({ uid });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    await Users.findOneAndUpdate({ uid }, { avatar: "", avatarPublicId: "" });
    res.status(200).json({ message: "Profile Image Removed Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// verify reset token
router.get("/verify-token/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.Secret_Key);

    const user = await Users.findOne({ uid: decoded.uid, resetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or used token." });
    }

    res.status(200).json({ message: "Token is valid." });
  } catch (error) {
    res.status(401).json({ message: "Token expired or invalid." });
  }
});

// Password Reset API Route
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email address" });
    }

    const resetToken = jwt.sign({ uid: user.uid }, process.env.Secret_Key, {
      expiresIn: "5m",
    });

    user.resetToken = resetToken;
    await user.save();

    const resetLink = `http://localhost:5173/auth/reset-password/${resetToken}`;

    await sendEmail(user.email, "Password Reset Link", resetLink);

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// save new password route
router.post("/save-new-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.Secret_Key);

    const user = await Users.findOne({ uid: decoded.uid, resetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or used token." });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    user.resetToken = "";
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(401).json({ message: "Token expired or invalid." });
  }
});

// Change Password route
router.patch("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { uid } = req;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long." });
    }
    const user = await Users.findOne({ uid }).select("+password").exec();

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as old password." });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    await user.save();

    const securityNotification = new Notification({
      recipient: uid,
      message: "Your password changed successfully.",
      type: "security",
    });
    await securityNotification.save();

    res.status(200).json({ message: "Password Changed Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = router;
