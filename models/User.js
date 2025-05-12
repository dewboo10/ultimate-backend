const mongoose = require("mongoose");

const brainGameSchema = new mongoose.Schema({
  bestScore: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  brainGames: {
    type: Map,
    of: brainGameSchema,
    default: {}
  },
  lastPlayed: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
