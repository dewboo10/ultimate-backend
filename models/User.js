const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  isPremium: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
