// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI ||
  "mongodb+srv://ayazalidharejo:ZdS4TYHEKkZiU6vK@cluster0.dgrrlwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Optionally exit the process if DB connection fails on startup
    // process.exit(1);
  }
};

module.exports = { connectDB };