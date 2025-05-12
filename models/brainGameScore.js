const mongoose = require("mongoose");

const brainGameScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  gameId: { type: String, required: true },
  score: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrainGameScore", brainGameScoreSchema);
