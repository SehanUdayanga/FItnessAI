const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedDemoData } = require('./seedHelper');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FitTrack API Backend Running Successfully!' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/water', require('./routes/waterRoutes'));
app.use('/api/weight', require('./routes/weightRoutes'));
app.use('/api/bmi', require('./routes/bmiRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/assistant', require('./routes/assistantRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize DB and start Express server
connectDB().then(async () => {
  await seedDemoData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
