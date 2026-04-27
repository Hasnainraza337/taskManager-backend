require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authrouter = require("./routes/auth");
const todorouter = require("./routes/todo");
const contactrouter = require("./routes/contact");
const notificationrouter = require("./routes/notification");
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
connectDB();
// Routes
app.use("/auth", authrouter);
app.use("/todo", todorouter);
app.use("/contact", contactrouter);
app.use("/notification", notificationrouter);

// Server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
