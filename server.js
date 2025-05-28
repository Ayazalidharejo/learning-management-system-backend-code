
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// Import config
const { connectDB } = require('./config/db');

// App Config
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ["https://learning-management-system-backend-code-aiqn.vercel.app","http://localhost:3000"] }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize Access Keys
const { initializeKeys } = require('./utils/initializeKeys');
initializeKeys();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);


app.get('/', async (req, res) => {
  try {
   res.send("welcome to lMS api");
  } catch (err) {
    res.status(500).json({message:"something wrong "});
  }
});


// Start server
app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`));
module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);

});
