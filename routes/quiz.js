// routes/quiz.js
const express = require("express");
const router = express.Router();
const QuizAttempt = require("../models/QuizAttempt");

router.post("/submit", async (req, res) => {
  const { username, exam, day, selectedAnswers } = req.body;

  try {
    const existing = await QuizAttempt.findOne({ username, exam, day });
    if (existing) {
      return res.status(400).json({ message: "Already submitted." });
    }

    const attempt = new QuizAttempt({
      username,
      exam,
      day,
      selectedAnswers,
      completed: true,
      submittedAt: new Date()
    });

    await attempt.save();
    return res.json({ message: "Quiz submitted and saved." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/attempt", async (req, res) => {
  const { username, exam, day } = req.query;

  try {
    const attempt = await QuizAttempt.findOne({ username, exam, day });
    if (!attempt) return res.status(404).json({ message: "No attempt found." });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
