const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://100dayschallenges.netlify.app"
  ],
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/quiz", require("./routes/quiz")); // ✅ PLACE THIS BEFORE listen()
app.use("/api/brain-games", require("./routes/braingames"));

// ✅ MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
