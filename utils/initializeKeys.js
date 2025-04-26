// utils/initializeKeys.js
const AccessKey = require('../models/AccessKey');

const initializeKeys = async () => {
  try {
    const adminKeyExists = await AccessKey.findOne({ role: 'admin' });
    if (!adminKeyExists) {
      await AccessKey.create({ key: 'admin123', role: 'admin' });

    }

    const superadminKeyExists = await AccessKey.findOne({ role: 'superadmin' });
    if (!superadminKeyExists) {
      await AccessKey.create({ key: 'superadmin123', role: 'superadmin' });
     
    }
  } catch (err) {
    // Handle potential unique constraint errors if run multiple times concurrently
    if (err.code !== 11000) {
      console.error('Error creating initial keys:', err);
    }
  }
};

module.exports = { initializeKeys };