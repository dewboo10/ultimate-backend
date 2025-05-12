// models/QuizAttempt.js
const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  exam: { type: String, required: true },
  day: { type: String, required: true },
  completed: { type: Boolean, default: true },
  selectedAnswers: { type: Object, default: {} },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
