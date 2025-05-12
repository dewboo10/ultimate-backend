// routes/brainGames.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/update-score", async (req, res) => {
  try {
    const { userId, gameId, score } = req.body;
    if (!userId || !gameId || typeof score !== "number") {
      return res.status(400).json({ success: false, message: "Invalid parameters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

   if (!user.brainGames) user.brainGames = {};
if (!user.brainGames[gameId]) {
  user.brainGames[gameId] = { bestScore: 0, attempts: 0, lastPlayed: new Date() };
}

user.brainGames[gameId].attempts += 1;
user.brainGames[gameId].bestScore = Math.max(user.brainGames[gameId].bestScore, score);
user.brainGames[gameId].lastPlayed = new Date();

    await user.save();

    res.json({ success: true, message: "Score updated", bestScore: gameData.bestScore });
  } catch (err) {
    console.error("Update Score Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
