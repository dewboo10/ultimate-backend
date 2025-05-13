const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
  username: String,
  exam: String,
  day: Number,
  selectedAnswers: Object,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
