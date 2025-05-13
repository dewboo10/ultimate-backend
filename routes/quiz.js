const express = require("express");
const router = express.Router();
const QuizAttempt = require("../models/quizAttempt");

// Submit quiz
router.post("/submit", async (req, res) => {
  const { username, exam, day, selectedAnswers } = req.body;
  try {
    const existing = await QuizAttempt.findOne({ username, exam, day });
    if (existing) return res.status(400).json({ message: "Already submitted" });

    const attempt = new QuizAttempt({ username, exam, day, selectedAnswers });
    await attempt.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz attempt
router.get("/get", async (req, res) => {
  const { username, exam, day } = req.query;
  const attempt = await QuizAttempt.findOne({ username, exam, day });
  if (!attempt) return res.status(404).json({ message: "Not found" });
  res.json(attempt);
});

module.exports = router;
