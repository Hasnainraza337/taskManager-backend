const mongoose = require("mongoose");

// Connection state ko track karne ke liye variable
let isConnected = false;

const connectDB = async () => {
  const { MongoDB_UserName, MongoDB_Password } = process.env;
  const uri = `mongodb+srv://${MongoDB_UserName}:${MongoDB_Password}@cluster0.luinnfe.mongodb.net/?appName=Cluster0`;

  // Agar pehle se connected hai, toh dubara connect mat karo
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(uri);

    // Connection state update karein (1 ka matlab connected hota hai)
    isConnected = db.connections[0].readyState;

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Serverless mein process.exit(1) ki jagah error throw karna behtar hai
    throw error;
  }
};

module.exports = { connectDB };
