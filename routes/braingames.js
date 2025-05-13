const express = require("express");
const router = express.Router();
const BrainGameScore = require("../models/brainGameScore");

// Submit or update score
router.post("/submit", async (req, res) => {
  const { username, gameId, score } = req.body;
  try {
    const existing = await BrainGameScore.findOne({ username, gameId });
    if (!existing || score > existing.score) {
      await BrainGameScore.findOneAndUpdate(
        { username, gameId },
        { score, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  const { gameId } = req.query;
  const topScores = await BrainGameScore.find({ gameId }).sort({ score: -1 }).limit(10);
  res.json(topScores);
});

module.exports = router;
