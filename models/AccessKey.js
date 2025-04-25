// models/AccessKey.js
const mongoose = require('mongoose');

const AccessKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    required: true
  }
});

module.exports = mongoose.model('AccessKey', AccessKeySchema);