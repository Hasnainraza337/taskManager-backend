const mongoose = require("mongoose");

const connectDB = async () => {
  const { mongodb_username, mongodb_password } = process.env;
  const uri = `mongodb+srv://${mongodb_username}:${mongodb_password}@cluster0.luinnfe.mongodb.net/?appName=Cluster0`;
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
