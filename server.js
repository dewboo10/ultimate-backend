const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Enable CORS for your frontend (Netlify)
app.use(cors({
  origin: "https://100dayschallenges.netlify.app",
  credentials: true
}));

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
