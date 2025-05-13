const mongoose = require("mongoose");

const BrainGameScoreSchema = new mongoose.Schema({
  username: String,
  gameId: String,
  score: Number,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrainGameScore", BrainGameScoreSchema);
