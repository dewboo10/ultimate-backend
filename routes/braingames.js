// routes/brainGames.js
const express = require("express");
const router = express.Router();
const BrainGameScore = require("../models/brainGameScore");

// ✅ Submit or update score
router.post("/submit", async (req, res) => {
  const { username, gameId, score } = req.body;

x  try {
    const existing = await BrainGameScore.findOne({ username, gameId });
    if (!existing || existing.score < score) {
      await BrainGameScore.findOneAndUpdate(
        { username, gameId },
        { score, updatedAt: new Date() },
        { upsert: true }
      );
    }
    res.json({ message: "Score updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get top 10 scores
router.get("/top", async (req, res) => {
  const { gameId } = req.query;

  try {
    const topScores = await BrainGameScore.find({ gameId })
      .sort({ score: -1 })
      .limit(10);
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get user’s best score
router.get("/user", async (req, res) => {
  const { username, gameId } = req.query;

  try {
    const score = await BrainGameScore.findOne({ username, gameId });
    res.json(score || { score: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
