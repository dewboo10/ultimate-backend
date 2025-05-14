require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middlewares/auth');
const Redis = require('ioredis');

const app = express();

// ✅ CORS Configuration (Netlify + local dev)
const allowedOrigins = [
  'https://100dayschallenges.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ CORS not allowed from:', origin);
      callback(new Error("CORS not allowed from this origin: " + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// ✅ MongoDB Connection (Fixed)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Redis Connection (Upstash)
const redisClient = new Redis(process.env.REDIS_URL);
global.redisClient = redisClient; // make it available globally if needed

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', authMiddleware, require('./routes/quiz'));
app.use('/api/brain-games', authMiddleware, require('./routes/braingames'));

// ✅ Error Handling
app.use((err, req, res, next) => {
  console.error('❌ Uncaught Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
