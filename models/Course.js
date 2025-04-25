// models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Course', CourseSchema);